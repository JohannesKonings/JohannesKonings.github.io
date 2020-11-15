---
layout:     post
title:      Technical setup
date:       2020-07-31 16:15:18
summary:    installed software and used hardware
categories: settings
thumbnail: chocolatey
tags:
 - software
 - hardware
---

- [1. technical setup](#1-technical-setup)
  - [1.1. Hardware](#11-hardware)
  - [1.2. WSL 2](#12-wsl-2)
    - [1.2.1. Update WSL1 to WSL2](#121-update-wsl1-to-wsl2)
    - [uninstall](#uninstall)
    - [1.2.2. ubuntu](#122-ubuntu)
  - [1.3. Terminals](#13-terminals)
    - [1.3.1. oh-my-posh](#131-oh-my-posh)
    - [1.3.2. oh-my-bash](#132-oh-my-bash)
    - [1.3.3. oh-my-zsh](#133-oh-my-zsh)
  - [1.4. Python](#14-python)
    - [1.4.1. pipenv](#141-pipenv)
  - [1.5. npm global](#15-npm-global)
  - [1.6. ssh git](#16-ssh-git)
  - [Video recording and editing](#video-recording-and-editing)
  - [1.7. winget](#17-winget)
  - [1.8. Chocolatey packages](#18-chocolatey-packages)
  - [1.9. Outlook sync](#19-outlook-sync)
  - [1.10. Windows Surface Recovery](#110-windows-surface-recovery)

# 1. technical setup

Disclaimer: This articel contains my current technical setup and will be updated from time to time

## 1.1. Hardware

The following are affiliate links.

[Microsoft Surface Pro 7](https://amzn.to/352ktwM)
{{< rawhtml >}}
<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ac&ref=tf_til&ad_type=product_link&tracking_id=johanneskonin-21&marketplace=amazon&region=DE&placement=B0725RLN7G&asins=B0725RLN7G&linkId=0d7c3c88bd6d1395251139e4bd9465b0&show_border=true&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff">
    </iframe>
{{< /rawhtml >}}

[LG 32MP58HQ](https://amzn.to/3exn457)
{{< rawhtml >}}
<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ac&ref=tf_til&ad_type=product_link&tracking_id=johanneskonin-21&marketplace=amazon&region=DE&placement=B01AWG5RDG&asins=B01AWG5RDG&linkId=d8cd744bc28e495c188657a38d6e1ad1&show_border=true&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=ffffff">
    </iframe>
{{< /rawhtml >}}    

[Dierya DK63](https://amzn.to/2IEooHl)
{{< rawhtml >}}
<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=johanneskonin-21&language=de_DE&marketplace=amazon&region=DE&placement=B086C5LD5X&asins=B086C5LD5X&linkId=69556c5a5607df0fc8b63cd3279233c7&show_border=true&link_opens_in_new_window=true"></iframe>
{{< /rawhtml >}}    

[ERGOTRON LX Monitor Arm in Schwarz](https://amzn.to/3kAdKih)
<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//ws-eu.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=DE&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=johanneskonin-21&language=de_DE&marketplace=amazon&region=DE&placement=B07Q8TJ2KL&asins=B07Q8TJ2KL&linkId=b2f9e00c80753ba9add84057ec252660&show_border=true&link_opens_in_new_window=true"></iframe>

## 1.2. WSL 2

`Enable-WindowsOptionalFeature -Online -FeatureName $("VirtualMachinePlatform", "Microsoft-Windows-Subsystem-Linux")`

[https://chocolatey.org/packages/wsl2/](https://chocolatey.org/packages/wsl2/)

[https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)

`wsl --list --verbose`

[WSL Tips and Tricks](https://craigloewen-msft.github.io/WSLTipsAndTricks/)

### 1.2.1. Update WSL1 to WSL2

https://admcpr.com/how-to-upgrade-wsl-1-to-wsl-2/

`wsl --set-version Ubuntu 2`

### uninstall 

`wsl --unregister DistributionName`

https://www.howtogeek.com/261188/how-to-uninstall-or-reinstall-windows-10s-ubuntu-bash-shell/

### 1.2.2. ubuntu

[https://chocolatey.org/packages/wsl-ubuntu-1804](https://chocolatey.org/packages/wsl-ubuntu-1804)

`apt install zsh`

## 1.3. Terminals

### 1.3.1. oh-my-posh

https://github.com/JanDeDobbeleer/oh-my-posh

https://chocolatey.org/packages/oh-my-posh

https://chocolatey.org/packages/poshgit

https://go.microsoft.com/fwlink/?LinkID=135170

[How to make a pretty prompt in Windows Terminal with Powerline, Nerd Fonts, Cascadia Code, WSL, and oh-my-posh](https://www.hanselman.com/blog/HowToMakeAPrettyPromptInWindowsTerminalWithPowerlineNerdFontsCascadiaCodeWSLAndOhmyposh.aspx)

`code $PROFILE`

https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7

`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

https://chocolatey.org/packages/cascadiacodepl

https://github.com/microsoft/cascadia-code/releases

`"fontFace": "Cascadia Code PL"`

### 1.3.2. oh-my-bash

https://ohmybash.github.io/

https://stackoverflow.com/questions/56839307/adding-git-bash-to-the-new-windows-terminal

### 1.3.3. oh-my-zsh

`apt install zsh`

https://ohmyz.sh/

## 1.4. Python

[Python](https://chocolatey.org/packages/python)

⚠ https://stackoverflow.com/questions/56974927/permission-denied-trying-to-run-python-on-windows-10/5744761 

`python -m pip install --upgrade pip`

### 1.4.1. pipenv

https://python-docs.readthedocs.io/en/latest/dev/virtualenvs.html#virtualenvironments-ref

`pip install --user pipenv`

## 1.5. npm global

`npm install -g serverless` 

`npm install -g @aws-amplify/cli`

## 1.6. ssh git

https://dev.to/bdbch/setting-up-ssh-and-git-on-windows-10-2khk?signin=true

`type C:\Users\<<username>>\.ssh\id_rsa.pub`

https://chocolatey.org/packages/gnupg

## Video recording and editing

OBS Studio and Shotcut

## 1.7. winget

[Windows Terminal Preview](https://winget.run/pkg/Microsoft/WindowsTerminalPreview)

[Google Chrome](https://winget.run/pkg/Google/Chrome)

[Docker Desktop Edge](https://winget.run/pkg/Docker/DockerDesktopEdge)

[Spotify](https://winget.run/pkg/Spotify/Spotify)

[Microsoft Teams](https://winget.run/pkg/Microsoft/Teams)

[Greenshot](https://winget.run/pkg/Greenshot/Greenshot)

[Visual Studio Code](https://winget.run/pkg/Microsoft/VisualStudioCode)

[Git](https://winget.run/pkg/Git/Git)

[Node.js](https://winget.run/pkg/OpenJS/NodeJS)

[AWS Command Line Interface v2](https://winget.run/pkg/Amazon/AWSCLI)

[Notepad++](https://winget.run/pkg/Notepad++/Notepad++)

[ScreenToGif](https://winget.run/pkg/NickeManarin/ScreenToGif)

[Camtasia](https://winget.run/pkg/TechSmith/Camtasia)

[OBS Studio](https://winget.run/pkg/OBSProject/OBSStudio)

[Shotcut](https://winget.run/pkg/Meltytech/Shotcut)

[Adobe Acrobat Reader](https://winget.run/pkg/Adobe/AdobeAcrobatReaderDC)

[Python](https://winget.run/pkg/Python/Python)

[7Zip](https://winget.run/pkg/7zip/7zip)

[RStudio Desktop](https://winget.run/pkg/RStudio/RStudio)

[Ruby](https://winget.run/pkg/RubyInstallerTeam/Ruby)

[Carnac](https://winget.run/pkg/code52/Carnac)

## 1.8. Chocolatey packages

[GoogleChrome](https://chocolatey.org/packages/GoogleChrome)

[ChocolateyGUI](https://chocolatey.org/packages/ChocolateyGUI)

[microsoft-windows-terminal](https://chocolatey.org/packages/microsoft-windows-terminal)

[Sudo](https://chocolatey.org/packages/Sudo)

[adobereader](https://chocolatey.org/packages/adobereader)

[7zip](https://chocolatey.org/packages/7zip)

[notepadplusplus](https://chocolatey.org/packages/notepadplusplus)

[git](https://chocolatey.org/packages/git)

[nodejs](https://chocolatey.org/packages/nodejs)

[wsl2](https://chocolatey.org/packages/wsl2)

[gnupg](https://chocolatey.org/packages/gnupg)

[oh-my-posh](https://chocolatey.org/packages/oh-my-posh)

[poshgit](https://chocolatey.org/packages/poshgit)

[vscode](https://chocolatey.org/packages/vscode)

[docker-desktop](https://chocolatey.org/packages/docker-desktop)

[wsl-ubuntu-1804](https://chocolatey.org/packages/wsl-ubuntu-1804)

[greenshot](https://chocolatey.org/packages/greenshot)

[awscli](https://chocolatey.org/packages/awscli)

[terraform](https://chocolatey.org/packages/terraform)

[openjdk](https://chocolatey.org/packages/openjdk)

[openssl](https://chocolatey.org/packages/openssl)

[ruby](https://chocolatey.org/packages/ruby)

[Shotcut](https://chocolatey.org/packages/Shotcut)

[Brave](https://chocolatey.org/packages/brave)

[Cascadia Code PL Font](https://chocolatey.org/packages/cascadiacodepl)

[jq](https://chocolatey.org/packages/jq)

[grammarly](https://chocolatey.org/packages/grammarly)

[AWS Tools for Windows PowerShell](https://chocolatey.org/packages/AWSTools.Powershell)

[mysql](https://chocolatey.org/packages/mysql)

[MySQL Workbench](https://chocolatey.org/packages/mysql.workbench)

[Screen To Gif](https://chocolatey.org/packages/screentogif)

[Gradle](https://chocolatey.org/packages/gradle)

[Postman for Windows](https://chocolatey.org/packages/postman)

[Graphviz - Graph Visualization Software](https://chocolatey.org/packages/Graphviz)

[nvm](https://chocolatey.org/packages/nvm)

## 1.9. Outlook sync

https://caldavsynchronizer.org/


## 1.10. Windows Surface Recovery

[Windows Device Recovery Tool](https://support.microsoft.com/en-us/windows/windows-device-recovery-tool-faq-2b186f06-7178-ed11-4cb6-5ed437f0855b)
