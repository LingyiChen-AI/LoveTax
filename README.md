<div align="center">

<picture>
  <img src="app/icon.svg" alt="LoveTax logo" width="96" height="96">
</picture>

# LoveTax · 爱情税

**情侣每日扣分小工具。** 每天 100 分。Ta 不满意,就给你开一张「爱情税单」。

![Next.js](https://img.shields.io/badge/Next.js-14-1F2937?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square)
![Postgres](https://img.shields.io/badge/Postgres-16-336791?style=flat-square)
![Tests](https://img.shields.io/badge/tests-25%20unit%20%2B%2031%20integration%20%2B%20E2E-success?style=flat-square)

</div>

---

## 这是什么

一个给情侣两个人玩的自托管扣分应用。

- 每个人**每天起手 100 分**。
- 对方惹你不开心了,你从对方的分里**扣 1-20 分**(默认 10),必须写**原因**。
- 每次扣分实时给被扣方**发邮件通知**。
- 24 点重置回 100。
- 报表能看趋势、高频原因、月度总结。

> 像两个人之间的「HP 血条对战」——但目标不是赢,而是想想 Ta 为什么扣你。

## 特性

- 📱 **移动优先 UI** —— gamified neo-brutalist 风(粗黑边 + 硬阴影 + 黄色主调)
- ⚔️ **VS 主页** —— 双血条 + 底部出招按钮
- ✉️ **真实邮件** —— SMTP 接入(QQ/Gmail/Mailgun/etc.),每次扣分/撤销/邀请都发
- 🧾 **报表** —— 今日仪表盘 / 7-30 天双折线趋势图 / 高频原因 Top 20 / 月度总结
- 🔄 **当天撤销** —— 手抖了?同一天内能撤销自己发的扣分,撤销也会通知对方
- 🛡 **管理员后台** —— 用户管理、情侣列表、扣分历史、邮件失败重发
- 🌍 **时区感知** —— 重置点按被扣方的时区算
- 🔒 **完整鉴权** —— Auth.js v5、bcrypt cost 12、JWT 90 天、速率限制
- 🧪 **认真测试** —— 25 个单元测试 + 31 个集成(真 Postgres)+ Playwright E2E 全程

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14 App Router · Server Actions |
| 语言 | TypeScript (strict) |
| 数据库 | Postgres 16 + Drizzle ORM |
| 认证 | Auth.js v5 (Credentials, JWT) |
| 邮件 | Nodemailer + @react-email/components |
| UI | Tailwind CSS + Radix UI (shadcn-style 定制) |
| 图表 | Recharts |
| 测试 | Vitest (unit + integration) + Playwright (E2E) |
| 部署 | Docker Compose, 自托管 |

## 本地开发

前置:Node 20+、Docker、一个 Postgres 实例(任何方式都行,见下)。

```bash
git clone git@github.com:LingyiChen-AI/LoveTax.git
cd LoveTax
cp .env.example .env
```

编辑 `.env`,把 `DATABASE_URL` 指到你的 Postgres。如果你**没有 Postgres**,起一个最小的:

```bash
docker run -d --name lovetax-pg \
  -e POSTGRES_USER=lovetax -e POSTGRES_PASSWORD=lovetax -e POSTGRES_DB=lovetax \
  -p 5432:5432 postgres:16-alpine
# .env: DATABASE_URL=postgres://lovetax:lovetax@localhost:5432/lovetax
```

然后:

```bash
docker compose -f docker-compose.dev.yml up -d   # 起 Mailpit(本地邮件收件箱)
npm install
npm run db:migrate
npm run seed:admin            # 用 .env 里的 SEED_ADMIN_EMAIL/PASSWORD 建管理员
npm run dev
```

打开 http://localhost:30001 · 邮件去 http://localhost:8025 (Mailpit) 查看。

### 配置真实 SMTP

把 `.env` 里的 `SMTP_HOST/PORT/USER/PASS` 改成你的服务商。QQ 邮箱举例:

```env
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=youremail@qq.com
SMTP_PASS=<在 QQ 邮箱设置里生成的 16 位授权码>
SMTP_FROM="LoveTax <youremail@qq.com>"
```

验证:`npx tsx scripts/smtp-test.ts` (默认发给 SMTP_USER 自己)。

## 测试

```bash
npm test                                            # unit
docker compose -f docker-compose.test.yml up -d     # 起测试栈
npm run test:integration                            # integration (真 Postgres)
npm run test:e2e                                    # Playwright 黄金路径
```

## 部署

见 [`docs/deployment.md`](docs/deployment.md) —— 包含一键 `docker compose up -d`、Caddy 反代示例、`pg_dump` 备份 cron。

## 项目文档

- **设计规范**:[`docs/superpowers/specs/2026-05-18-couples-app-design.md`](docs/superpowers/specs/2026-05-18-couples-app-design.md)
- **实施计划**(58 个任务,带完整代码):[`docs/superpowers/plans/2026-05-18-couples-app.md`](docs/superpowers/plans/2026-05-18-couples-app.md)
- **部署指南**:[`docs/deployment.md`](docs/deployment.md)

## 路线图

下一版可能做:

- [ ] 原因标签 / 分类(中文 jieba 分词 → 更精准的 Top-N)
- [ ] 自助密码重置(目前只能 admin 重置)
- [ ] Web Push / 移动端推送
- [ ] React Native App
- [ ] 多语言 i18n
- [ ] 「奖励分」/ 正向反馈模式
- [ ] 纪念日时间线

## 许可

私人项目,暂未指定开源协议。
