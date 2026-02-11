# <p align="center">🤖 AI Prompt Expert 🚀✨</p>

<p align="center">The AI prompt expert rewrites users' simple prompts into high-quality prompts in the structures of CO-STAR, CRISPE, QStar (Q*), the variational method, Meta Prompting, Chain of Thought (CoT), Microsoft's optimization method and RISE. Moreover, it allows for online modification and testing. It also provides optimization for prompts used for generating images from text and can convert them into high-quality English prompts with just one click.</p>

<p align="center"><a href="https://302.ai/product/detail/24" target="blank"><img src="https://file.302.ai/gpt/imgs/github/20250102/72a57c4263944b73bf521830878ae39a.png" /></a></p >

<p align="center"><a href="README.md">中文</a> | <a href="README_en.md">English</a> | <a href="README_ja.md">日本語</a></p>

![Interface Preview](docs/提示词专家en.png)

The open-source version of [AI Prompt Expert](https://302.ai/product/detail/24) from [302.AI](https://302.ai/en/).
You can directly log in to 302.AI to use the online version with zero code and zero configuration.
Or modify this project according to your needs, input 302.AI's API KEY, and deploy it yourself.

## Interface Preview
Enter a simple description, and the AI will generate high-quality prompts. There are multiple structures available for selection. It supports online modification and testing of prompts.
![Interface Preview](docs/提示专家英.png)


## Project Features
### 🛠️ Multiple optimization solutions
 It supports 12 different prompt optimization solutions and provides the ability to customize the optimization framework.
### 🎯 Classic Optimization Frameworks
- CO-STAR structure: Systematic prompt organization method
- CRISPE structure: Comprehensive content generation framework
- Chain of Thought (CoT): Improve output quality through thought chains
### 🎯 Professional Creation Optimization
- DRAW: Professional AI drawing prompt optimization
- RISE: Structured prompt enhancement system
- O1-STYLE: Stylized creation prompt solution
### 🎯 Advanced Optimization Techniques
- Meta Prompting: Meta prompt optimization
- VARI: Variational optimization
- Q*: Intelligent prompt optimization algorithm
### 🎯 Mainstream AI Platform Adaptation
- OpenAI optimization: Adapted for GPT series models
- Claude optimization: Adapted for Anthropic models
- Microsoft optimization: Adapted for Azure AI services
### 🌍 Multi-language Support
- Chinese Interface
- English Interface
- Japanese Interface


Through AI Prompt Expert! - Transform your ideas into perfect AI instructions! 🎉💻 Let's explore the new world of AI-driven code together! 🌟🚀

## 🚩 Future Update Plans 
- [ ] Industry Segmentation Prompt Optimization
- [ ] Update Emerging Models
- [ ] Add Conversion Functions for Languages such as French, German, Spanish

## Tech Stack
- React
- Tailwind CSS
- Radix UI

## Development & Deployment

### Method 1: Local Development
1. Clone project `git clone https://github.com/302ai/302_prompt_generator`
2. Install dependencies `yarn install`
3. Configure 302's API KEY (refer to .env.example)
4. Run project `yarn dev`
5. Visit http://localhost:5173

### Method 2: Docker Deployment

#### Using Makefile (Recommended)
```bash
# Build image
make build

# Start container
make run

# View logs
make logs

# Stop container
make stop

# Clean up
make clean

# View all commands
make help
```

#### Using Docker Compose
1. Copy environment variables `cp .env.example .env`
2. Modify `.env` file, configure your API KEY
3. Start service `docker-compose up -d`
4. Visit http://localhost:3000

#### Using Docker Commands
```bash
# Build image
docker build -t 302-prompt-generator:latest .

# Run container
docker run -d -p 3000:80 --name 302-prompt-generator 302-prompt-generator:latest
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_APP_API_KEY | 302 AI API Key | - |
| VITE_APP_SHOW_BRAND | Show 302 AI brand | true |
| VITE_APP_MODEL_NAME | AI model name | gpt-4o |
| VITE_APP_REGION | Region (0: China, 1: Global) | 0 |
| VITE_APP_LOCALE | Language (zh/en/ja) | en |
| VITE_APP_API_URL | API URL | https://api.302.ai |
| PORT | Port number | 3000 |