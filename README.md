# 为神国祷告 (Prayer For Kingdom)

一个帮助您记录和统计为基督国度祷告内容和时间的移动应用程序。

## 功能特点

- 记录每次祷告的开始和结束时间
- 可以填写祷告主题和备注
- 区分祷告类型（日常祷告、周末祷告、禁食祷告等）
- 完全离线使用，保护您的隐私
- 数据导出和导入功能，方便备份和恢复
- 详细的统计功能，包括祷告历史分钟数据直方图

## 技术栈

- React Native / Expo
- TypeScript
- SQLite 数据库
- React Navigation
- React Native Chart Kit

## 安装和运行

### 前提条件

- Node.js (>= 14.0.0)
- npm 或 yarn
- Expo CLI

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/wb-dirac/Prayer-For-Kingdom.git
cd Prayer-For-Kingdom
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 启动开发服务器

```bash
npx expo start
```

4. 使用Expo Go应用扫描二维码在您的设备上运行应用，或者使用模拟器/模拟器运行。

## 项目结构

```
Prayer-For-Kingdom/
├── src/
│   ├── components/       # 可复用组件
│   ├── contexts/         # React Context
│   ├── navigation/       # 导航配置
│   ├── screens/          # 屏幕组件
│   ├── services/         # 服务（数据库、文件等）
│   ├── types/            # TypeScript类型定义
│   └── utils/            # 工具函数
├── assets/               # 静态资源
├── App.tsx               # 应用入口
└── package.json          # 项目依赖
```

## 使用说明

1. **开始祷告**：在主屏幕点击"开始新的祷告"按钮，填写祷告主题、选择类型并添加可选的备注。
2. **结束祷告**：在活动祷告界面点击"结束祷告"按钮。
3. **查看历史**：在底部导航栏点击"历史"标签，可以查看所有祷告记录。
4. **查看统计**：在底部导航栏点击"统计"标签，可以查看祷告统计数据和图表。
5. **导出/导入数据**：在"设置"页面中，可以导出数据进行备份，或从备份文件中导入数据。

## 贡献

欢迎提交问题和拉取请求！

## 许可证

MIT 