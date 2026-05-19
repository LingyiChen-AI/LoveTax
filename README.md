<div align="center">

<picture>
  <img src="app/icon.svg" alt="LoveTax logo" width="96" height="96">
</picture>

# LoveTax · 爱情税

**情侣每日扣分小工具。** 每天 100 分。Ta 不满意,就给你开一张「爱情税单」。

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square)
![Postgres](https://img.shields.io/badge/Postgres-16-336791?style=flat-square)
![Tests](https://img.shields.io/badge/tests-33%20unit%20%2B%2039%20integration%20%2B%20E2E-34C759?style=flat-square)
![Docker](https://img.shields.io/badge/docker-twwch%2Flovetax-2496ED?style=flat-square)

</div>

---

## 这是什么

一个给情侣两个人玩的自托管扣分应用。

- 每个人**每天起手 100 分**。
- Ta 惹你不开心,你从 Ta 分里**扣 1-20 分**(默认 10),必须写**原因**。
- Ta 让你开心,你也可以反过来**夸 Ta**,加 1-20 分(封顶 100)。
- 每次操作实时给 Ta **发邮件**。
- 24 点重置回 100(按 Ta 的时区)。
- 报表能看趋势、高频原因(被扣/被夸 × 我/Ta 四档)、月度总结。

> 像两个人之间的「HP 血条对战」 — 但目标不是赢,而是想想 Ta 为什么扣你。

## 特性

- 📱 **移动优先** — Apple 风格 UI · 浅绿主题 · 系统色 #34C759
- ⚔️ **VS 主页** — 双血条 + 「出招」(扣)/「夸 Ta」(加)双按钮
- ✉️ **真实邮件** — SMTP 接入(QQ / Gmail / Mailgun ...) · 扣分邮件按剩余分梯度自动附加调侃话术(60 / 30 / 0)
- 🧾 **报表** — 今日仪表盘 / 7-30 天双折线趋势图 / 高频原因 Top 20 / 月度总结
- 🔑 **密码自助修改** — 邮箱验证码方式,10 分钟有效
- 🛡 **管理员后台** — 用户管理、情侣列表、扣分历史、邮件失败重发
- 🌍 **时区感知** — 重置点按被扣方的时区算
- 🔒 **完整鉴权** — Auth.js v5 · bcrypt cost 12 · JWT 90 天 · 速率限制
- 🧪 **认真测试** — 33 单元 + 39 集成(真 Postgres) + Playwright E2E

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14 App Router · Server Actions |
| 语言 | TypeScript (strict) |
| 数据库 | Postgres 16 + Drizzle ORM(单表多态:`deductions.kind = 'deduct' \| 'bonus'`) |
| 认证 | Auth.js v5 (Credentials, JWT, 90d) |
| 邮件 | Nodemailer + @react-email/components |
| UI | Tailwind CSS + Radix UI (Apple-system 定制) |
| 图表 | Recharts |
| 测试 | Vitest (unit + integration) + Playwright (E2E) |
| CI/CD | GitHub Actions → Docker Hub (`twwch/lovetax`) |
| 部署 | Docker Compose, 自托管 |

## 本地开发

前置:Node 20+、一个 Postgres 16 实例。

```bash
git clone git@github.com:LingyiChen-AI/LoveTax.git
cd LoveTax
cp .env.example .env
```

编辑 `.env`,把 `DATABASE_URL` 指到你的 Postgres。没有现成的就起一个最小的:

```bash
docker run -d --name lovetax-pg \
  -e POSTGRES_USER=lovetax -e POSTGRES_PASSWORD=lovetax -e POSTGRES_DB=lovetax \
  -p 5432:5432 postgres:16-alpine
# .env: DATABASE_URL=postgres://lovetax:lovetax@localhost:5432/lovetax
```

然后:

```bash
npm install
npm run db:migrate
npm run seed:admin   # 按 .env 里的 SEED_ADMIN_EMAIL/PASSWORD 建管理员
npm run dev
```

打开 **http://localhost:30001** 登录(用刚才 seed 的 admin)。

### 邮件 — 真实 SMTP

把 `.env` 里的 `SMTP_*` 改成你的服务商。QQ 邮箱举例:

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=youremail@qq.com
SMTP_PASS=<在 QQ 邮箱设置里生成的 16 位授权码>
SMTP_FROM="LoveTax <youremail@qq.com>"
```

验证连通性:`npx tsx scripts/smtp-test.ts`(默认发给 `SMTP_USER` 自己)。

### 邮件 — 本地 Mailpit(开发模式可选)

不想发真邮件?用 Mailpit 把所有邮件捕获到本地 web UI:

```bash
docker compose -f docker-compose.dev.yml up -d
# .env: SMTP_HOST=localhost SMTP_PORT=1025 SMTP_USER= SMTP_PASS=
```

邮件查看:http://localhost:8025

## 测试

```bash
npm test                                          # unit (33)
docker compose -f docker-compose.test.yml up -d   # 起测试栈(独立 Postgres + Mailpit)
npm run test:integration                          # integration · 真 Postgres (39)
npm run test:e2e                                  # Playwright 黄金路径
```

## Docker 部署

CI 已经在每次 `main` 推送时把镜像构建并推到 Docker Hub:**`twwch/lovetax`**。

最小一行启动:

```bash
docker run -d --name lovetax \
  -p 30001:30001 \
  -e DATABASE_URL=postgres://USER:PASS@HOST:5432/DB \
  -e AUTH_SECRET=$(openssl rand -base64 32) \
  -e AUTH_URL=https://your.domain \
  -e APP_URL=https://your.domain \
  -e SMTP_HOST=smtp.qq.com -e SMTP_PORT=465 \
  -e SMTP_USER=... -e SMTP_PASS=... \
  -e SMTP_FROM="LoveTax <...>" \
  -e SEED_ADMIN_EMAIL=admin@example.com \
  -e SEED_ADMIN_PASSWORD=ChangeMeOnFirstLogin1 \
  -e TRUST_PROXY=true \
  twwch/lovetax:latest
```

容器启动时自动跑 migrations + admin seed(已存在就跳过)。配合反代:见 [`docs/deployment.md`](docs/deployment.md) 里的 Caddyfile / Nginx 示例。

完整 stack(Postgres + 应用)用 [`docker-compose.yml`](docker-compose.yml)。

## CI

GitHub Actions:

| Workflow | 触发 | 做什么 |
|---|---|---|
| [`docker.yml`](.github/workflows/docker.yml) | push to main / tag `v*` | 构建并推 Docker 镜像 + 打 GitHub Release |

测试在本地跑(见上一节),不进 CI。

## 项目文档

- 设计规范 [`docs/superpowers/specs/`](docs/superpowers/specs/)
  - [主功能(2026-05-18)](docs/superpowers/specs/2026-05-18-couples-app-design.md)
  - [加分功能(2026-05-19)](docs/superpowers/specs/2026-05-19-bonus-points-design.md)
- 实施计划 [`docs/superpowers/plans/`](docs/superpowers/plans/)
- 部署指南 [`docs/deployment.md`](docs/deployment.md)

## 路线图

- [x] 加分 / 夸 Ta(双向)
- [x] 邮箱验证码改密
- [x] 扣分邮件按梯度附调侃话术
- [x] Docker 镜像 CI
- [ ] 原因标签 / 自动分类(可能用 jieba 或 LLM)
- [ ] Web Push / 移动端推送
- [ ] React Native App
- [ ] 多语言 i18n
- [ ] 纪念日时间线

## 许可

私人项目,暂未指定开源协议。
