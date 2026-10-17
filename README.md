# 雅思词汇听写合集

支持 Windows 和 macOS 的离线桌面工具，包含听写、生词本、错词本、今日复习，以及听力、阅读、写作和口语分类练习。学习数据保存在本地。

## 下载 v1.1.1（测试版）

- [Windows 10/11 · 64 位](https://github.com/AyasakiBrown/ielts-vocab-desktop/releases/download/v1.1.1/IELTSVocab-Windows-x64-1.1.1.zip)
- [macOS 13+ · Intel / Apple Silicon](https://github.com/AyasakiBrown/ielts-vocab-desktop/releases/download/v1.1.1/IELTSVocab-macOS-universal-1.1.1.zip)
- [完整源码包](https://github.com/AyasakiBrown/ielts-vocab-desktop/releases/download/v1.1.1/IELTSVocab-Source-1.1.1.zip)
- [更新说明与全部附件](https://github.com/AyasakiBrown/ielts-vocab-desktop/releases/tag/v1.1.1)

Windows 版本尚未完成真机验证，因此本版标记为测试版。

## 安装与首次打开

**Windows：** 完整解压后双击 `IELTSVocab.exe`，请保留同文件夹的其余文件。

**Mac：** 解压后将应用拖入“应用程序”。本版仅本地签名，尚未获得 Apple 公证。若提示“无法验证开发者”或“Apple 无法检查是否包含恶意软件”，确认下载来源后先尝试打开一次，再前往 **系统设置 → 隐私与安全性 → 仍要打开**。无需关闭系统整体安全保护。

发音依赖系统英语语音；离线发音需已安装本地语音。

## v1.1.1 更新

- 生词本增加英文释义、相近拼写建议和重复词提示；再次添加已有单词时可更新原条目。
- 补充部分词典释义；「补全释义」保留自行修改过的内容。
- 生词条目按编辑时间保存，较旧记录不会覆盖较新的释义和分类修改。
- 学习记录改为表格，显示完成题数、正确题数和正确率；默认最近 7 天，可切换全部，修正跨月日期排序。
- 听写提交按钮的按键提示跟随自定义快捷键；清除绑定后隐藏提示。

## v1.1.0 新增：今日复习与错因训练

- **今日复习**：首页「📅 今日复习」（默认 ⌘6 / Ctrl+6）。三个词库、生词本、错词本按单词合并为一份复习记录，到期的词进入统一队列，每日上限默认 60。
- **跨天掌握**：听写与选择题分开记录；只有到期后、且不在上次答错或提示的同一天无提示答对才升级（间隔 1/3/7/14/30 天）。答错的词当轮隔几题重测。
- **英式、美式拼写都判对**：使用经核实的对照表（colour/color、organise/organize 等），不再放行 caer、exercize 这类错拼。
- **较新的答案优先保存**：进度与复习记录按答题时间合并，旧数据不会覆盖新进度。
- **错因诊断与针对训练**：听写答错时提示错因并标出出错片段；「🎯 针对训练」按错因分组练习，练过的词次日无提示复测，通过后才升级。

升级保留原有进度、错词和每日记录。**v1.1.0 导出的完整备份无法在旧版中恢复**；旧版备份可在新版中恢复。更新前建议先在旧版「学习数据」中导出一份完整备份。

快捷键可在 **帮助 → 快捷键设置**（默认 F1）中修改。

## 隐私与源码

发布包不附带作者的学习记录、个人生词、备份、同步私钥或自定义键位。本次为桌面离线版，不含手机同步。

应用源码在本仓库的 [`dev` 分支](https://github.com/AyasakiBrown/ielts-vocab-desktop/tree/dev)：`src/` 为页面与 Mac 外壳，`release-tools/` 为 Windows 外壳、构建脚本和测试。构建方法见 `release-tools/README.md`「从源码构建」，各版本与源码提交的对应见 `release-tools/VERSIONS.md`。

v1.1.0 及更早版本的标签指向下载说明提交，对应源码以 `dev` 上的导入提交和 Release 中的 `IELTSVocab-Source-*.zip` 为准；GitHub 自动生成的“Source code”附件不等于完整应用源码。

第三方词书、词典和图片的公开分发授权尚未核实；对外公开分发前需核实相关授权。
