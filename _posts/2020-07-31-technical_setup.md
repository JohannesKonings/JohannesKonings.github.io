---
layout:     post
title:      Technical setup
date:       2020-07-31 16:15:18
summary:    installed software
categories: react
thumbnail: chocolatey
tags:
 - react
 - react components
---

- [technical setup](#technical-setup)
  - [Hardware](#hardware)
  - [WSL 2](#wsl-2)
    - [ubuntu](#ubuntu)
  - [Terminals](#terminals)
    - [oh-my-posh](#oh-my-posh)
    - [oh-my-bash](#oh-my-bash)
    - [oh-my-zsh](#oh-my-zsh)
  - [Python](#python)
    - [pipenv](#pipenv)
  - [npm global](#npm-global)
  - [Chocolatey packages](#chocolatey-packages)

# technical setup

Disclaimer: This articel contains my current technical setup and will be updated from time to time

## Hardware

[Microsoft Surface Pro 7](https://www.microsoft.com/en-us/p/surface-pro-7/8n17j0m5zzqs?activetab=overview)

## WSL 2

`Enable-WindowsOptionalFeature -Online -FeatureName $("VirtualMachinePlatform", "Microsoft-Windows-Subsystem-Linux")`

[https://chocolatey.org/packages/wsl2/](https://chocolatey.org/packages/wsl2/)

[https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)

`wsl --list --verbose`

[WSL Tips and Tricks](https://craigloewen-msft.github.io/WSLTipsAndTricks/)

### Update WSL1 to WSL2

https://admcpr.com/how-to-upgrade-wsl-1-to-wsl-2/

`wsl --set-version Ubuntu 2`

### ubuntu

[https://chocolatey.org/packages/wsl-ubuntu-1804](https://chocolatey.org/packages/wsl-ubuntu-1804)

`apt install zsh`

## Terminals

### oh-my-posh

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

### oh-my-bash

https://ohmybash.github.io/

### oh-my-zsh

`apt install zsh`

https://ohmyz.sh/

## Python

[Python](https://chocolatey.org/packages/python)

⚠ https://stackoverflow.com/questions/56974927/permission-denied-trying-to-run-python-on-windows-10/5744761 

`python -m pip install --upgrade pip`

### pipenv

https://python-docs.readthedocs.io/en/latest/dev/virtualenvs.html#virtualenvironments-ref

`pip install --user pipenv`

## npm global

`npm install -g serverless` 

`npm install -g @aws-amplify/cli`

## winget

[Windows Terminal Preview](https://winget.run/pkg/Microsoft/WindowsTerminalPreview)

[Google Chrome](https://winget.run/pkg/Google/Chrome)

[Docker Desktop Edge](https://winget.run/pkg/Docker/DockerDesktopEdge)

[Spotify](https://winget.run/pkg/Spotify/Spotify)

[Microsoft Teams](https://winget.run/pkg/Microsoft/Teams)

[Greenshot](https://winget.run/pkg/Greenshot/Greenshot)

[Visual Studio Code](https://winget.run/pkg/Microsoft/VisualStudioCode)

## Chocolatey packages

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

## Windows Surface Recovery

[Windows Device Recovery Tool](https://support.microsoft.com/en-us/windows/windows-device-recovery-tool-faq-2b186f06-7178-ed11-4cb6-5ed437f0855b)
