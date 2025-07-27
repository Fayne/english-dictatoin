# 英语默写练习系统

一个基于Vue.js和Contentful的全栈英语默写练习应用。

## 功能特性

- 🎯 **智能默写练习**: 用户可以选择默写单词数量（5-30个）
- 🔊 **音频播放**: 支持单词发音播放
- ✅ **实时拼写检测**: 自动检测用户输入的正确性
- 📊 **数据统计**: 显示练习历史和正确率统计
- 💾 **本地存储**: 使用localStorage保存练习记录
- 📱 **响应式设计**: 支持移动端和桌面端

## 技术栈

### 前端
- **Vue.js 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **Pinia** - Vue状态管理
- **Vue Router** - 路由管理

### 后端/内容管理
- **Contentful** - 无头CMS，用于管理单词内容

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   └── DictationComponent.vue    # 默写练习组件
│   ├── services/
│   │   ├── contentful.ts             # Contentful API服务
│   │   └── localStorage.ts           # 本地存储服务
│   ├── stores/
│   │   └── dictation.ts              # Pinia状态管理
│   ├── views/
│   │   └── HomeView.vue              # 主页面
│   └── App.vue                       # 根组件
├── .env                              # 环境变量配置
└── package.json                      # 项目依赖
```

## 安装和设置

### 1. 克隆项目
```bash
git clone <repository-url>
cd english-dictation
```

### 2. 安装依赖
```bash
cd frontend
npm install
```

### 3. 配置Contentful

1. 在[Contentful](https://www.contentful.com/)创建账户
2. 创建新的Space
3. 创建Content Type，命名为"englishDictation"，包含以下字段：
   - `english` (Short text) - 英文单词
   - `chinese` (Short text) - 中文翻译
   - `voice` (Media, 可选) - 发音音频文件

4. 复制`.env`文件并填入你的Contentful配置：
```bash
cp .env.example .env
```

编辑`.env`文件：
```env
VITE_CONTENTFUL_SPACE_ID=your_space_id_here
VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token_here
VITE_CONTENTFUL_ENVIRONMENT=master
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 使用说明

### 管理员操作（Contentful）
1. 登录Contentful管理界面
2. 在"englishDictation" Content Type中添加单词条目
3. 填写english（英文单词）、chinese（中文翻译）
4. 上传voice音频文件（可选）
5. 发布内容

### 用户操作
1. 打开应用主页
2. 选择想要默写的单词数量
3. 点击"开始默写"
4. 根据中文翻译和发音提示输入英文单词
5. 系统自动检测拼写正确性
6. 完成后查看详细结果和统计信息

## 数据存储

- **Contentful**: 存储单词内容（单词、翻译、发音、音频）
- **localStorage**: 存储用户练习记录和统计数据

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码格式化
npm run format

# 运行测试
npm run test:unit

# 运行E2E测试
npm run test:e2e
```

## 部署

1. 构建项目：
```bash
npm run build
```

2. 将`dist`目录部署到你的Web服务器

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License