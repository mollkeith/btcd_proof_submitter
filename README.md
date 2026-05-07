# Proof Submitter

一个用于提交 BTC 相关 proof 的前端静态页面。

## 支持内容

- 网络：`staging`、`pg`
- 钱包：MetaMask、Coinbase Wallet 以及其他注入式 EVM 钱包
- 质押证明：`submitToLenderTransferProof`
- 解锁证明：`submitRegularUnlockTransferProof`
- 延期证明：`submitRenewalOrderProof`
- 延期补仓证明：`submitRenewalOrderProof`

页面会自动：

- 连接 EVM 钱包
- 切换到目标网络
- 查询 BTC 交易
- 生成 merkle proof
- 发起链上交易并等待确认

## 目录结构

```text
proof_submitter/
├── contracts/
│   ├── abi/
│   │   ├── Issuer.json
│   │   └── ObsidianOrder.json
│   └── networks/
│       ├── pgp.json
│       └── staging.json
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

说明：

- `index.html`：页面主文件
- `contracts/abi/`：合约 ABI
- `contracts/networks/`：网络配置和合约地址

## 环境要求

需要本机安装：

- `Node.js`
- `npm`
- `python3`

当前本地服务通过 `python3 -m http.server` 启动。这样做是为了绕过当前环境下部分 Node 静态服务的网卡枚举问题。

## 安装依赖

```bash
npm install
```

## 启动方式

### 开发启动

```bash
npm run dev
```

访问：

- [http://127.0.0.1:5173/index.html](http://127.0.0.1:5173/index.html)
- [http://localhost:5173/index.html](http://localhost:5173/index.html)

### 普通启动

```bash
npm run start
```

### 预览端口

```bash
npm run preview
```

访问：

- [http://127.0.0.1:4173/index.html](http://127.0.0.1:4173/index.html)

## package.json 脚本

```json
{
  "scripts": {
    "dev": "python3 -m http.server 5173 --bind 127.0.0.1",
    "start": "python3 -m http.server 5173 --bind 127.0.0.1",
    "preview": "python3 -m http.server 4173 --bind 127.0.0.1"
  }
}
```

## 使用流程

1. 打开页面
2. 选择网络：`staging` 或 `pg`
3. 选择证明类型：
   - 质押证明
   - 解锁证明
   - 延期证明
   - 延期补仓证明
4. 点击右上角 `Connect`
5. 选择一个可用的 EVM 钱包
6. 输入：
   - `Order ID / 订单合约地址`
   - `BTC 交易哈希`（质押证明、解锁证明、延期补仓证明时需要）
7. 点击“生成 proof 并提交”
8. 等待交易打包完成

## 备注

- BTC 交易默认要求至少 `3` 个确认
- 质押证明提交时，`toLenderTxIndex` 固定传 `0`
- 解锁证明调用 `Issuer` 合约
- 延期证明调用订单合约
- 延期证明不显示 `BTC 交易哈希` 输入框，会直接提交空 proof
- 延期补仓证明调用订单合约，并使用 BTC 哈希生成 proof
- 交易 gas fee 由当前连接的钱包支付

## 常见问题

### 1. `npm run dev` 启动失败怎么办？

先确认本机安装了 `python3`：

```bash
python3 --version
```

再重新执行：

```bash
npm run dev
```

### 2. 页面打开了，但无法连接钱包

请确认：

- 已安装至少一个 EVM 钱包扩展
- 当前浏览器允许钱包扩展注入
- 钱包没有被站点权限拦截

### 3. 提交 proof 时报 BTC 确认数不足

等待 BTC 交易确认数达到 `3` 后再提交。

### 4. 端口被占用怎么办？

可以修改 `package.json` 中的端口，例如：

```json
"dev": "python3 -m http.server 5180 --bind 127.0.0.1"
```

## 快速开始

```bash
npm install
npm run dev
```

然后打开：

```text
http://127.0.0.1:5173/index.html
```
