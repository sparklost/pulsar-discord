const createConfig = require('./config');
const fs = require('fs').promises;
const { ipcRenderer, remote } = require('electron');
const path = require('path');

const SEND_DISCORD_PATH = require.resolve('./send-discord.js');
const config = {
    i18n: {
        default: require('../i18n/en-US.json'),
        value: require(`../i18n/${atom.config.get('pulsar-discord.i18n') || 'en-US'}.json`)
    },
    logPath: path.join(atom.getConfigDirPath(), 'pulsar-discord-log.txt'),
    loggable: atom.config.get('pulsar-discord.troubleShooting.debugLog')
};

const translate = (key, args = {}) => {
    let tr = config.i18n.value[key];
    if (!tr) tr = config.i18n.default[key] || 'UNDEFINED_TRANSLATION';
    Object.keys(args).forEach((i) => tr = tr.replace(new RegExp(`%${i}%`, 'g'), args[i]));
    return tr;
};

const showError = (key, args, detail) => {
    atom.notifications.addError(
        translate(key, args),
        {
            description: translate(`${key}-desc`, args),
            detail: detail || translate(`${key}-detail`, args)
        }
    );
    if (detail) console.error("[pulsar-discord ERROR]", detail);
};

const initialize = async () => {
    try {
        const notInitialized = !remote.getGlobal("$PULSAR_DISCORD");
        remote.require(SEND_DISCORD_PATH);
        if (notInitialized) {
            ipcRenderer.send('pulsar-discord.initialize');
        }
    } catch (err) {
        showError('error-while-require', {}, err.stack);
    }

    if (config.loggable) {
        try {
            await fs.writeFile(config.logPath, '');
        } catch (err) {
            showError('generate-failed', { file: 'pulsar-discord-log.txt' }, err.stack);
            config.loggable = false;
        }
    }
    ipcRenderer.send('pulsar-discord.logging', { loggable: config.loggable, path: config.logPath });
};

const updater = {};
const createLoop = () => {
    let currEditor = null;
    let projectName = null;
    let pluginBlur = false;
    let pluginAfk = false;
    let isPresenceDisabled = false;
    const rendererId = Math.random().toString(36).slice(2);
    const updateData = () => {
        if (isPresenceDisabled) {
            ipcRenderer.send('pulsar-discord.offline', { id: rendererId });
            return;
        }
        ipcRenderer.send('pulsar-discord.data-update', {
            currEditor,
            projectName,
            pluginOnline: !pluginBlur && !pluginAfk
        });
    };
    atom.getCurrentWindow().on('close', () => {
        ipcRenderer.send('pulsar-discord.offline', { id: rendererId });
    });

    const afkHandle = () => {
        let lastSeen = Date.now();
        const updateAfk = () => lastSeen = Date.now();
        document.addEventListener('mousemove', () => updateAfk());
        document.addEventListener('mousedown', () => updateAfk());
        atom.views.getView(atom.workspace).addEventListener('keydown', () => updateAfk());
        const afkLoop = () => {
            const isAFK = Date.now() > lastSeen + atom.config.get('pulsar-discord.rest.restOnAfkThreshold') * 1000;
            if (pluginAfk && !isAFK) {
                pluginAfk = false;
                updateData();
            } else if (!pluginAfk && isAFK) {
                pluginAfk = true;
                updateData();
            }
            setTimeout(afkLoop, 1000);
        };
        afkLoop();
    };

    if (atom.config.get('pulsar-discord.rest.restOnAfk')) afkHandle();

    const blurHandle = () => {
        let lastBlur = null;
        atom.getCurrentWindow().on('focus', () => {
            pluginBlur = false;
            lastBlur = null;
            updateData();
        });
        atom.getCurrentWindow().on('blur', () => {
            const blurDate = Date.now();
            lastBlur = blurDate;

            setTimeout(() => {
                if (lastBlur === blurDate) {
                    pluginBlur = true;
                    updateData();
                }
            }, atom.config.get('pulsar-discord.rest.restOnBlurThreshold'));
        });
    };

    if (atom.config.get('pulsar-discord.rest.restOnBlur')) blurHandle();

    let onlineEditor = atom.workspace.getActiveTextEditor();
    if (onlineEditor && onlineEditor.getTitle) currEditor = onlineEditor.getTitle();

    const updateProjectName = () => {
        isPresenceDisabled = false;
        if (onlineEditor && onlineEditor.buffer && onlineEditor.buffer.file) {
            const projectPath = atom.project.relativizePath(onlineEditor.buffer.file.path)[0];
            if (!projectPath) {
                projectName = null;
            } else {
                projectName = path.basename(projectPath);
                let overrides = {};
                try {
                    const overridesStr = atom.config.get('pulsar-discord.behaviour.projectOverrides') || '{}';
                    overrides = JSON.parse(overridesStr);
                } catch (err) {
                    console.error("[pulsar-discord] Failed to parse projectOverrides JSON string:", err);
                }
                if (overrides && overrides.hasOwnProperty(projectPath)) {
                    const customizedName = overrides[projectPath];

                    if (customizedName === null) {
                        isPresenceDisabled = true;
                        projectName = null;
                    } else if (customizedName) {
                        projectName = customizedName;
                    }
                }
            }
        } else {
            projectName = null;
        }
    };

    atom.workspace.onDidChangeActiveTextEditor((editor) => {
        onlineEditor = editor;
        if (editor && editor.getTitle) {
            currEditor = editor.getTitle();
            updateProjectName();
        } else {
            currEditor = null;
        }
        updateData();
    });

    atom.project.onDidChangePaths((projectPaths) => {
        updateProjectName();
        updateData();
    });

    updateProjectName();
    updateData();
    updater.updateProjectName = updateProjectName;
    updater.updateData = updateData;
    ipcRenderer.send('pulsar-discord.online', { id: rendererId });
    if (atom.config.get('pulsar-discord.troubleShooting.noDiscordNotification')) {
        ipcRenderer.once('pulsar-discord.noDiscord', () => {
            showError('error-no-discord');
        });
    }
};

module.exports = {
    activate() {
        initialize().then(() => {
            createLoop();
            atom.commands.add('atom-workspace', "pulsar-discord:toggle", (ev) => {
                ipcRenderer.send('pulsar-discord.toggle');
            });
            atom.config.onDidChange('pulsar-discord', ev => {
                setTimeout(() => ipcRenderer.send('pulsar-discord.updateConfig'), 500);
            });
        });
    },
    config: createConfig(translate)
};
