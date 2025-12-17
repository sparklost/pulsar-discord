# Installation

## Installing from Pulsar Package Manager
Either download the package via the built in package manager (Pulsar Settings > Install > pulsar-discord) or run `pulsar -p install pulsar-discord` in your terminal of choice.

## Installing from Source Code
To install pulsar-discord you will need to download the [latest](https://git-scm.com/download) version of git.  
Then open terminal and navigate to an empty folder, then enter the following into the terminal:  
```
git clone https://github.com/sparklost/pulsar-discord.git
cd pulsar-discord
npm i
pulsar -p link
```

Then **add pulsar to discord game list** and restart pulsar to see the effects.

---

# FAQ

## Changeable Text
To change other texts like 'Editing a (name) file', follow this steps:
1. **Open i18n file**
Open file located in `(UserDirectory)/.pulsar/packages/pulsar-discord/i18n/(Currently Using Language).json`
2. **Change desired text**
Change content of the json file in order to change your desired text.
## "Playing Pulsar Editor" Text
To change the "Playing Pulsar Editor" text you will need to make a new [discord developer application](https://discordapp.com/developers/applications/), you can do this by repeating the following steps:
1. **Create a new discord developer application**
Click [Here](https://discordapp.com/developers/applications/) and create a new application.
2. **Set your app name and turn on rich presence**
Your app name will later be displayed as `Playing <app-name>`.
3. **Set Client ID to your application**
Copy your `Application ID`.  
And in pulsar-discord package settings change `Settings > Behaviour > Custom Client ID` into your Application ID.  
4. **Upload icons assets**
Download all of the programming languages icons ([available here](https://github.com/HelloWorld017/fileicons-render/tree/main/icons)) and upload them all under Rich Presence > Rich Presence Assets (if you miss one it won't work!). The asset name should be filename of the image (without the `.png`!).
5. **Upload custom image assets**
Now, under same assets, upload the custom image that will replace original Pulsar icon. Imust have asset name `pulsar`.

## Rich Presence is not showing
- Check if the Pulsar is added in the games tab.
- Check if the option `Display currently running game as a status message.` is turned on in Discord.
- Restart the Pulsar and Discord.
- Try installing from source:
Open the terminal and type the following: `pulsar -p uninstall pulsar-discord`  
Then, [reinstall pulsar-discord from the source code](https://github.com/sparklost/pulsar-discord#installing-from-source-code) and restart Pulsar and discord.  

## Getting debug info
- Turn on Debug Mode option in package settings
- Restart Pulsar
- Open file `(UserDirectory)/.pulsar/pulsar-discord/Log.txt

---

# License

Released under the [MIT](https://en.wikipedia.org/wiki/MIT_License) License.

>MIT License
>
>Copyright (c) 2018 HelloWorld017  
>Copyright (c) 2024 sparklost
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
