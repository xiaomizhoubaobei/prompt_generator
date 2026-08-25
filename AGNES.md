# AGNES 说明

## 环境变量说明

### `GH_TOKEN`

`GH_TOKEN` 就是 **GitHub 的 token**（GitHub Personal Access Token）。

它用于 GitHub API 的认证，在执行 GitHub 相关操作（如推送代码、创建 Issue / PR、读取仓库数据、调用 GitHub REST API 等）时作为访问凭据使用。

> 注意：请妥善保管 GH_TOKEN，严禁将其明文提交到仓库、写入日志或输出到评论中，避免凭据泄露。
