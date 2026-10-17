# 发布版本与源码对应

应用源码在 `dev` 分支上开发。`main` 分支只放下载说明（仓库首页 README）。

| 版本 | 标签指向 | 对应源码 | 说明 |
| --- | --- | --- | --- |
| v1.1.1 | `v1.1.1`（源码提交） | 同一标签及 `SOURCE_COMMIT.txt` | 英文释义、生词编辑、学习记录表格及快捷键提示；测试版 |
| v1.0.0 – v1.0.2 | README 提交 | 无存档源码包 | 早期只发布了程序包 |
| v1.0.3 | `b841bd1`（README 提交） | `dev` 上的「导入 v1.0.3 发布源码」提交 | 由 `IELTSVocab-Source-1.0.3.zip` 逐字节导入，SHA-256 `0d23802034086a212f06a7fa7947ea52e07151a60451fb3d7787ac3063cbc2fd` |
| v1.1.0 | `b841bd1`（README 提交，早于当前 README） | `dev` 上的「导入 v1.1.0 发布源码」提交 | 由 `IELTSVocab-Source-1.1.0.zip` 逐字节导入，SHA-256 `849737d095a543d2e2cdf34e55db669316c4090485f16db02bfa593b40890dcf` |

v1.1.1 的标签直接指向本次发布源码提交；完整提交号同时写入发布附件 `SOURCE_COMMIT.txt`。

旧标签保持不动：它们已公开，移动标签会让已下载的人对不上号。v1.0.3 与 v1.1.0 的源码以上表的导入提交为准。

## 从下一版本开始

1. 所有应用改动先提交到 `dev`，界面和逻辑修改通过提交差异审阅。
2. `python3 release-tools/build_release.py` 在 `src/`、`release-tools/`、`build.sh` 有未提交改动时会拒绝构建；构建成功后把提交号写入发布目录和源码包里的 `SOURCE_COMMIT.txt`。
3. 发布后从这个提交创建带注释的新标签（脚本最后会打印命令），例如 `git tag -a v1.2.0 <提交> -m "v1.2.0"`，再推送标签。
4. 在上表追加一行。

## 不入库的文件

证书、私钥、学习数据、构建出的 `.app`、`GitHub-Release/` 发布产物，以及本机 iPhone 同步工具（`server.py`、`*.command`、`使用说明.md`、`migrate.py`）都被 `.gitignore` 排除，不随公开源码发布。依赖 `server.py` 的 `test_server_merge.py` 因此只能在原开发目录运行。
