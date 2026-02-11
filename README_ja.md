 # <p align="center">🤖 AI プロンプトエキスパート 🚀✨</p>


<p align="center">AI プロンプト専門家は、ユーザーのシンプルなプロンプトを、CO-STAR、CRISPE、QStar（Q*）、変分法、Meta Prompting、思考の連鎖（CoT）、マイクロソフトの最適化法、RISE 構造の高品質なプロンプトに書き換えます。また、オンラインでの修正とテストも可能です。また、文字から画像を生成するためのプロンプトの最適化も提供し、高品質の英語のプロンプトに一括変換することができます。</p>

<p align="center"><a href="https://302.ai/product/detail/24" target="blank"><img src="https://file.302.ai/gpt/imgs/github/20250102/72a57c4263944b73bf521830878ae39a.png" /></a></p >

<p align="center"><a href="README.md">中文</a> | <a href="README_en.md">English</a> | <a href="README_ja.md">日本語</a></p>

![インターフェースプレビュー](docs/提示词专家jp.png)

これは[302.AI](https://302.ai/ja/)の[AIプロンプトエキスパート](https://302.ai/product/detail/24)のオープンソース版です。
302.AIに直接ログインして、コーディング不要で設定不要のオンラインバージョンをご利用いただけます。
また、このプロジェクトをご自身のニーズに合わせて修正し、302.AIのAPI KEYを設定して独自にデプロイすることも可能です。


## インターフェースプレビュー
シンプルな説明を入力すると、AI が高品質なプロンプトを生成します。複数の構造が選択可能です。プロンプトのオンラインでの修正とテストをサポートしています。
![インターフェースプレビュー](docs/提示专家2.png)

## プロジェクトの特徴
### 🛠️ 複数の最適化案
12 種類の異なるプロンプト最適化案をサポートし、最適化フレームワークをカスタマイズする機能を提供しています。 

### 🎯 クラシック最適化フレームワーク
- CO-STAR構造：体系的なプロンプト組織方法
- CRISPE構造：包括的なコンテンツ生成フレームワーク
- Chain of Thought (CoT)：思考連鎖による出力品質の向上
### 🎯 プロフェッショナルクリエイション最適化
- DRAW：プロフェッショナルなAIアート生成プロンプト最適化
- RISE：構造化されたプロンプト強化システム
- O1-STYLE：スタイル化クリエイションプロンプトソリューション
### 🎯 高度な最適化技術
- Meta Prompting：メタプロンプト最適化
- VARI：変分法最適化
- Q*：インテリジェントプロンプト最適化アルゴリズム
### 🎯 主要AIプラットフォーム適応
- OpenAI最適化：GPTシリーズモデル向け
- Claude最適化：Anthropicモデル向け
- Microsoft最適化：Azure AIサービス向け
### 🌍 多言語サポート
- 中国語インターフェース
- 英語インターフェース
- 日本語インターフェース


AIプロンプトエキスパートで、あなたのアイデアを完璧なAI指示に変換しましょう！ 🎉💻 AIが駆動する新しいコードの世界を一緒に探検しましょう！ 🌟🚀

## 🚩 将来のアップデート計画
- [ ] 業界細分化プロンプト最適化
- [ ] 新興モデルを更新する
- [ ] フランス語、ドイツ語、スペイン語などの言語への変換機能を追加する


## 技術スタック
- React
- Tailwind CSS
- Radix UI

## 開発とデプロイ

### 方法1：ローカル開発
1. プロジェクトのクローン `git clone https://github.com/302ai/302_prompt_generator`
2. 依存関係のインストール `yarn install`
3. 302のAPI KEYの設定 .env.exampleを参照
4. プロジェクトの実行 `yarn dev`
5. http://localhost:5173 にアクセス

### 方法2：Dockerデプロイ

#### Makefileを使用（推奨）
```bash
# イメージのビルド
make build

# コンテナの起動
make run

# ログの表示
make logs

# コンテナの停止
make stop

# クリーンアップ
make clean

# すべてのコマンドを表示
make help
```

#### Docker Composeを使用
1. 環境変数のコピー `cp .env.example .env`
2. `.env` ファイルを変更し、API KEYを設定
3. サービスの起動 `docker-compose up -d`
4. http://localhost:3000 にアクセス

#### Dockerコマンドを使用
```bash
# イメージのビルド
docker build -t 302-prompt-generator:latest .

# コンテナの実行
docker run -d -p 3000:80 --name 302-prompt-generator 302-prompt-generator:latest
```

### 環境変数
| 変数 | 説明 | デフォルト |
|------|------|----------|
| VITE_APP_API_KEY | 302 AI APIキー | - |
| VITE_APP_SHOW_BRAND | 302 AIブランドを表示 | true |
| VITE_APP_MODEL_NAME | AIモデル名 | gpt-4o |
| VITE_APP_REGION | リージョン（0:中国, 1:世界） | 0 |
| VITE_APP_LOCALE | 言語（zh/en/ja） | ja |
| VITE_APP_API_URL | API URL | https://api.302.ai |
| PORT | ポート番号 | 3000 |
