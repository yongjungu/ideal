const axios = require('axios');

class AIService {
  constructor() {
    this.models = {
      openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        headers: () => ({
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        })
      },
      anthropic: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com/v1',
        headers: () => ({
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        })
      },
      custom: {
        name: 'Custom',
        baseUrl: process.env.CUSTOM_AI_API_URL,
        headers: () => ({
          'Content-Type': 'application/json'
        })
      }
    };
  }

  // 生成小说大纲
  async generateNovelOutline(params) {
    const { theme, style, length, volumeCount, model = 'openai' } = params;
    
    const prompt = `你是一位专业的小说策划师，精通小说结构设计和故事架构设计。
现在需要你根据以下信息，生成一个完整的小说大纲：
- 小说主题：${theme}
- 写作风格：${style}
- 小说预期长度：${length}
- 分卷数量：${volumeCount}

请设计包含标题、主题、人物设定、故事概述和详细的分卷计划。回复我的时候再确定检查下，别格式回复少了，示例如下所示：

{
"title": "小说标题",
"core_theme": "核心主题与思想",
"characters": [
{
"name": "角色名",
"role": "角色类型(主角/配角/反派)",
"description": "角色描述"
}
],
"synopsis": "故事概述，500字左右",
"volumes": [
{
"title": "分卷标题",
"summary": "分卷概述",
"chapters": [
{
"title": "章节标题",
"summary": "章节概述"
}
]
}
],
"world_setting": "世界观设定"
}

创作要求：
1. 每个分卷必须包含至少5个章节，每个章节必须有明确的标题和内容概述
2. 角色设计应符合故事主题和风格，主要角色应有鲜明的性格特点和成长弧线
3. 故事概述应包含完整的起承转合，包括设定场景、冲突、高潮和结局
4. 世界观设定应当完整并与故事情节紧密结合

【人物塑造要求】
1. 主角应有明确的动机和目标，有独特的性格特点和内在冲突
2. 配角应能推动主角成长或情节发展，不可只是背景人物
3. 反派角色需有合理动机，避免单纯的"邪恶"形象
4. 每个角色需设置成长弧线，随着故事发展有所变化

【故事结构要求】
1. 开篇需要有吸引人的引子，建立明确的故事基调
2. 中间部分需设置递进式的冲突，保持紧张感和阅读兴趣
3. 故事高潮部分必须有足够的铺垫，不可突兀出现
4. 结局应该合理解决主要冲突，同时可留有余地

技术要求：
1. 参考上述JSON格式
2. 所有字符串最好使用双引号
3. 所有数组和对象最好正确闭合
4. 最后一个属性后不要加逗号
5. world_setting最好是最后一个属性。

请严格按照JSON格式返回，不要包含任何额外的说明文字。`;

    try {
      const response = await this.callAI(model, prompt, 0.7, 2000);
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error('生成小说大纲失败:', error);
      throw new Error('AI服务暂时不可用，请稍后重试');
    }
  }

  // 生成章节内容
  async generateChapter(params) {
    const {
      novel_title,
      core_theme,
      volume_title,
      volume_summary,
      chapter_title,
      chapter_summary,
      chapter_index,
      total_chapters,
      characters,
      world_setting,
      previous_chapters_summary,
      target_words = 1500,
      model = 'openai'
    } = params;

    const prompt = `你是一位专业小说写作助手，擅长根据大纲编写章节内容。
现在，你需要根据以下信息，生成一个完整的小说章节：

小说标题：${novel_title}
小说核心主题：${core_theme}
卷标题：${volume_title}
卷概述：${volume_summary}
章节标题：${chapter_title}
章节概述：${chapter_summary}
章节位置：${chapter_index}/${total_chapters}

相关角色：
${JSON.stringify(characters, null, 2)}

世界设定：
${world_setting}

前几章内容摘要：
${previous_chapters_summary}

【上下文连贯性要求】
1. 必须严格参考前几章的内容摘要，确保故事情节连贯，前后呼应
2. 所有情节发展必须符合小说大纲和章节概要的设定，不得偏离主体大纲
3. 人物性格、能力和关系必须与前文保持一致
4. 应总结并延续上文的悬念和伏笔，巧妙地衔接前文内容
5. 当前章节内容应自然过渡到下一章内容，为后续章节做好铺垫

【章节结构要求】
1. 在这个章节中设置明确的小高潮或转折点，使故事情节紧凑有序
2. 通过角色对话推动情节发展，减少冗长的背景介绍和内心独白
3. 章节应具有完整的起承转合结构，包含铺垫、发展、高潮和结尾
4. 设计一到两个令人难忘的场景画面作为本章节的亮点
5. 开头第一段必须引人入胜，结尾最后一段必须留有想象空间

【逻辑性要求】
1. 确保每个情节承接自然流畅，从一个场景过渡到下一个场景时合理描述事件或情绪变化
2. 避免突然的情节转折，让读者感到突兀，通过铺垫逐步引导读者进入高潮部分
3. 人物对话必须符合其性格和处境，不应有违背人物设定的对话内容
4. 保持世界规则的一致性，不出现与已建立世界观相冲突的情节

请根据以上信息，创作一个符合章节概述的完整章节内容。内容应当包含以下要素：
1. 精彩的场景描写
2. 生动的人物对话
3. 合理的情节发展
4. 与整体小说主题和风格一致
目标字数：${target_words}字左右

请直接生成章节的完整内容，不要包含任何前导说明。内容应该包括章节标题、多个段落的正文内容，以及合理的段落划分。`;

    try {
      const response = await this.callAI(model, prompt, 0.8, 2500);
      return response.trim();
    } catch (error) {
      console.error('生成章节内容失败:', error);
      throw new Error('AI服务暂时不可用，请稍后重试');
    }
  }

  // 编辑章节内容
  async editChapter(params) {
    const {
      chapter_title,
      original_content,
      model = 'openai'
    } = params;

    const prompt = `你是一位资深的小说编辑，擅长改进和优化小说章节。
请对以下小说章节内容进行编辑和优化：

章节标题：${chapter_title}

原始内容：
${original_content}

【编辑重点】
1. 修正语法和拼写错误
- 纠正所有语法、标点和拼写问题
- 确保句子结构完整，避免语义不清的表达
2. 改进句子结构和段落流畅度
- 优化句式，避免重复冗余的表达
- 调整过长或过短的段落，保持适当的节奏感
- 优化段落之间的过渡，使行文更加流畅自然
3. 丰富描述和对话
- 增强场景描写的细节和感染力
- 使人物对话更加生动，更符合角色特点
- 增加适当的感官描写和情绪表达
4. 确保情节连贯性和角色一致性
- 检查并修正情节中的逻辑错误或矛盾之处
- 确保角色行为和对话与其性格设定一致
- 保持故事背景和设定的一致性
5. 提升整体阅读体验
- 强化章节的关键场景和高潮部分
- 调整叙事节奏，增强读者的代入感和阅读兴趣
- 确保章节内容与整体故事主题相呼应

【编辑原则】
- 保留原有内容的核心情节和风格特点
- 编辑应当增强而非改变作者的创作意图
- 所有修改都应当自然融入文本，不显突兀
- 注重提升文学性的同时不牺牲可读性和通俗性

请直接给出完整的优化后内容，无需解释修改内容。保持原有的章节结构，但可以适当调整以提升阅读体验。`;

    try {
      const response = await this.callAI(model, prompt, 0.6, 3000);
      return response.trim();
    } catch (error) {
      console.error('编辑章节内容失败:', error);
      throw new Error('AI服务暂时不可用，请稍后重试');
    }
  }

  // 调用AI API
  async callAI(model, prompt, temperature = 0.7, maxTokens = 2000) {
    const modelConfig = this.models[model];
    if (!modelConfig) {
      throw new Error(`不支持的AI模型: ${model}`);
    }

    try {
      let response;
      
      if (model === 'openai') {
        response = await axios.post(`${modelConfig.baseUrl}/chat/completions`, {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: temperature,
          max_tokens: maxTokens
        }, {
          headers: modelConfig.headers()
        });
        
        return response.data.choices[0].message.content;
        
      } else if (model === 'anthropic') {
        response = await axios.post(`${modelConfig.baseUrl}/messages`, {
          model: 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [{ role: 'user', content: prompt }]
        }, {
          headers: modelConfig.headers()
        });
        
        return response.data.content[0].text;
        
      } else if (model === 'custom') {
        // 自定义模型调用逻辑
        response = await axios.post(modelConfig.baseUrl, {
          prompt: prompt,
          temperature: temperature,
          max_tokens: maxTokens
        }, {
          headers: modelConfig.headers()
        });
        
        return response.data.result || response.data.text || response.data.content;
      }
      
    } catch (error) {
      console.error(`调用${modelConfig.name} API失败:`, error.response?.data || error.message);
      throw new Error(`AI服务调用失败: ${error.message}`);
    }
  }

  // 解析JSON响应
  parseJSONResponse(response) {
    try {
      // 尝试直接解析
      return JSON.parse(response);
    } catch (error) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('AI返回的JSON格式不正确');
        }
      }
      throw new Error('无法解析AI返回的内容');
    }
  }

  // 获取支持的模型列表
  getSupportedModels() {
    return Object.keys(this.models).map(key => ({
      id: key,
      name: this.models[key].name
    }));
  }
}

module.exports = new AIService();
