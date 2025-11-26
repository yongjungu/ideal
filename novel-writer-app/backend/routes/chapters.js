const express = require('express');
const Novel = require('../models/Novel');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 生成章节内容
router.post('/generate', auth, async (req, res) => {
  try {
    const {
      novelId,
      volumeIndex,
      chapterIndex,
      targetWords = 1500,
      model = 'openai'
    } = req.body;

    if (!novelId || !volumeIndex || !chapterIndex) {
      return res.status(400).json({
        success: false,
        message: '请提供小说ID、分卷索引和章节索引'
      });
    }

    // 获取小说信息
    const novel = await Novel.findOne({
      _id: novelId,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    const volume = novel.volumes[volumeIndex - 1];
    if (!volume) {
      return res.status(404).json({
        success: false,
        message: '分卷不存在'
      });
    }

    const chapter = volume.chapters[chapterIndex - 1];
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 获取前几章的内容摘要
    const previousChapters = [];
    for (let i = 0; i < chapterIndex - 1; i++) {
      const prevChapter = volume.chapters[i];
      if (prevChapter && prevChapter.content) {
        previousChapters.push({
          title: prevChapter.title,
          summary: prevChapter.summary,
          content: prevChapter.content.substring(0, 500) // 限制摘要长度
        });
      }
    }

    const previousChaptersSummary = previousChapters
      .map(chap => `【${chap.title}】\n${chap.content}`)
      .join('\n\n');

    // 调用AI服务生成章节内容
    const chapterContent = await aiService.generateChapter({
      novel_title: novel.title,
      core_theme: novel.coreTheme,
      volume_title: volume.title,
      volume_summary: volume.summary,
      chapter_title: chapter.title,
      chapter_summary: chapter.summary,
      chapter_index: chapterIndex,
      total_chapters: volume.chapters.length,
      characters: novel.characters,
      world_setting: novel.worldSetting,
      previous_chapters_summary: previousChaptersSummary,
      target_words: targetWords,
      model
    });

    // 更新章节内容
    chapter.content = chapterContent;
    chapter.isGenerated = true;
    chapter.generationPrompt = `使用模型: ${model}, 目标字数: ${targetWords}`;
    chapter.wordCount = chapterContent.length;

    await novel.save();

    // 更新用户统计
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'usageStats.chaptersGenerated': 1,
        'usageStats.totalWords': chapter.wordCount
      }
    });

    res.json({
      success: true,
      message: '章节内容生成成功',
      data: {
        chapter: {
          content: chapter.content,
          wordCount: chapter.wordCount,
          isGenerated: chapter.isGenerated
        }
      }
    });

  } catch (error) {
    console.error('生成章节内容错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成章节内容失败'
    });
  }
});

// 编辑章节内容
router.post('/edit', auth, async (req, res) => {
  try {
    const {
      novelId,
      volumeIndex,
      chapterIndex,
      model = 'openai'
    } = req.body;

    if (!novelId || !volumeIndex || !chapterIndex) {
      return res.status(400).json({
        success: false,
        message: '请提供小说ID、分卷索引和章节索引'
      });
    }

    // 获取小说信息
    const novel = await Novel.findOne({
      _id: novelId,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    const volume = novel.volumes[volumeIndex - 1];
    if (!volume) {
      return res.status(404).json({
        success: false,
        message: '分卷不存在'
      });
    }

    const chapter = volume.chapters[chapterIndex - 1];
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    if (!chapter.content) {
      return res.status(400).json({
        success: false,
        message: '章节内容为空，无法编辑'
      });
    }

    // 调用AI服务编辑章节内容
    const editedContent = await aiService.editChapter({
      chapter_title: chapter.title,
      original_content: chapter.content,
      model
    });

    // 保存编辑后的内容
    chapter.editedContent = editedContent;
    chapter.wordCount = editedContent.length;

    await novel.save();

    res.json({
      success: true,
      message: '章节内容编辑成功',
      data: {
        chapter: {
          editedContent: chapter.editedContent,
          wordCount: chapter.wordCount
        }
      }
    });

  } catch (error) {
    console.error('编辑章节内容错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '编辑章节内容失败'
    });
  }
});

// 更新章节内容（手动编辑）
router.put('/:novelId/volumes/:volumeIndex/chapters/:chapterIndex', auth, async (req, res) => {
  try {
    const { content, title, summary, status } = req.body;
    const { novelId, volumeIndex, chapterIndex } = req.params;

    const novel = await Novel.findOne({
      _id: novelId,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    const volume = novel.volumes[volumeIndex - 1];
    if (!volume) {
      return res.status(404).json({
        success: false,
        message: '分卷不存在'
      });
    }

    const chapter = volume.chapters[chapterIndex - 1];
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    // 更新章节信息
    if (content !== undefined) {
      chapter.content = content;
      chapter.wordCount = content.length;
    }
    if (title !== undefined) chapter.title = title;
    if (summary !== undefined) chapter.summary = summary;
    if (status !== undefined) chapter.status = status;

    await novel.save();

    res.json({
      success: true,
      message: '章节更新成功',
      data: { chapter }
    });

  } catch (error) {
    console.error('更新章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，更新失败'
    });
  }
});

// 获取章节内容
router.get('/:novelId/volumes/:volumeIndex/chapters/:chapterIndex', auth, async (req, res) => {
  try {
    const { novelId, volumeIndex, chapterIndex } = req.params;

    const novel = await Novel.findOne({
      _id: novelId,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    const volume = novel.volumes[volumeIndex - 1];
    if (!volume) {
      return res.status(404).json({
        success: false,
        message: '分卷不存在'
      });
    }

    const chapter = volume.chapters[chapterIndex - 1];
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: '章节不存在'
      });
    }

    res.json({
      success: true,
      data: { chapter }
    });

  } catch (error) {
    console.error('获取章节内容错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除章节
router.delete('/:novelId/volumes/:volumeIndex/chapters/:chapterIndex', auth, async (req, res) => {
  try {
    const { novelId, volumeIndex, chapterIndex } = req.params;

    const novel = await Novel.findOne({
      _id: novelId,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    const volume = novel.volumes[volumeIndex - 1];
    if (!volume) {
      return res.status(404).json({
        success: false,
        message: '分卷不存在'
      });
    }

    // 删除指定章节
    volume.chapters.splice(chapterIndex - 1, 1);

    // 重新编号后续章节
    for (let i = chapterIndex - 1; i < volume.chapters.length; i++) {
      volume.chapters[i].chapterIndex = i + 1;
    }

    await novel.save();

    res.json({
      success: true,
      message: '章节删除成功'
    });

  } catch (error) {
    console.error('删除章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，删除失败'
    });
  }
});

// 获取支持的AI模型列表
router.get('/ai-models', auth, async (req, res) => {
  try {
    const models = aiService.getSupportedModels();

    res.json({
      success: true,
      data: { models }
    });

  } catch (error) {
    console.error('获取AI模型列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
