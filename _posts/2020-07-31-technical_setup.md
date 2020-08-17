---
layout:     post
title:      Technical setup
date:       2020-07-31 16:15:18
summary:    installed software
categories: settings
thumbnail: chocolatey
tags:
 - technical setup
 - chocolatey
---

# technical setup

Disclaimer: This articel contains my current technical setup and will be updated from time to time

## Hardware

[Microsoft Surface Pro 7](https://www.microsoft.com/en-us/p/surface-pro-7/8n17j0m5zzqs?activetab=overview)

## WSL 2

[https://chocolatey.org/packages/wsl2/](https://chocolatey.org/packages/wsl2/)

[https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel](https://docs.microsoft.com/en-us/windows/wsl/wsl2-kernel)

`wsl --list --verbose`

[WSL Tips and Tricks](https://craigloewen-msft.github.io/WSLTipsAndTricks/)

### ubuntu

[https://chocolatey.org/packages/wsl-ubuntu-1804](https://chocolatey.org/packages/wsl-ubuntu-1804)

`apt install zsh`

## Terminals

### oh-my-posh

https://github.com/JanDeDobbeleer/oh-my-posh

https://chocolatey.org/packages/oh-my-posh

https://chocolatey.org/packages/poshgit

https://go.microsoft.com/fwlink/?LinkID=135170

https://www.hanselman.com/blog/HowToMakeAPrettyPromptInWindowsTerminalWithPowerlineNerdFontsCascadiaCodeWSLAndOhmyposh.aspx

`code $PROFILE`

https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7

`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

https://chocolatey.org/packages/cascadiacodepl

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
