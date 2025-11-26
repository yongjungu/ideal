const express = require('express');
const Novel = require('../models/Novel');
const User = require('../models/User');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 获取用户的所有小说
router.get('/', auth, async (req, res) => {
  try {
    const novels = await Novel.find({ author: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-volumes.chapters.content');

    res.json({
      success: true,
      data: {
        novels,
        total: novels.length
      }
    });

  } catch (error) {
    console.error('获取小说列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取单个小说详情
router.get('/:id', auth, async (req, res) => {
  try {
    const novel = await Novel.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    res.json({
      success: true,
      data: { novel }
    });

  } catch (error) {
    console.error('获取小说详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 生成小说大纲
router.post('/generate-outline', auth, async (req, res) => {
  try {
    const { theme, style, length, volumeCount, genre, model = 'openai' } = req.body;

    if (!theme || !style || !length || !volumeCount || !genre) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 调用AI服务生成大纲
    const outline = await aiService.generateNovelOutline({
      theme,
      style,
      length,
      volumeCount,
      model
    });

    // 创建小说草稿
    const novel = new Novel({
      title: outline.title,
      author: req.user._id,
      coreTheme: outline.core_theme,
      writingStyle: style,
      expectedLength: length,
      genre: genre,
      characters: outline.characters,
      synopsis: outline.synopsis,
      worldSetting: outline.world_setting,
      outline: outline,
      volumes: outline.volumes.map((volume, index) => ({
        title: volume.title,
        summary: volume.summary,
        volumeIndex: index + 1,
        chapters: volume.chapters.map((chapter, chapIndex) => ({
          title: chapter.title,
          summary: chapter.summary,
          chapterIndex: chapIndex + 1,
          content: '',
          isGenerated: false
        }))
      }))
    });

    await novel.save();

    // 更新用户统计
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'usageStats.novelsCreated': 1 }
    });

    res.json({
      success: true,
      message: '小说大纲生成成功',
      data: {
        novel: {
          id: novel._id,
          title: novel.title,
          outline: novel.outline,
          volumes: novel.volumes
        }
      }
    });

  } catch (error) {
    console.error('生成小说大纲错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成小说大纲失败'
    });
  }
});

// 创建自定义小说
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      coreTheme,
      writingStyle,
      expectedLength,
      genre,
      characters,
      synopsis,
      worldSetting,
      volumes
    } = req.body;

    if (!title || !coreTheme || !writingStyle || !expectedLength || !genre) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    const novel = new Novel({
      title,
      author: req.user._id,
      coreTheme,
      writingStyle,
      expectedLength,
      genre,
      characters: characters || [],
      synopsis: synopsis || '',
      worldSetting: worldSetting || '',
      volumes: volumes || []
    });

    await novel.save();

    // 更新用户统计
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'usageStats.novelsCreated': 1 }
    });

    res.status(201).json({
      success: true,
      message: '小说创建成功',
      data: { novel }
    });

  } catch (error) {
    console.error('创建小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，创建失败'
    });
  }
});

// 更新小说信息
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      coreTheme,
      writingStyle,
      expectedLength,
      genre,
      characters,
      synopsis,
      worldSetting,
      status,
      isPublic
    } = req.body;

    const novel = await Novel.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.user._id
      },
      {
        $set: {
          ...(title && { title }),
          ...(coreTheme && { coreTheme }),
          ...(writingStyle && { writingStyle }),
          ...(expectedLength && { expectedLength }),
          ...(genre && { genre }),
          ...(characters && { characters }),
          ...(synopsis && { synopsis }),
          ...(worldSetting && { worldSetting }),
          ...(status && { status }),
          ...(isPublic !== undefined && { isPublic })
        }
      },
      { new: true, runValidators: true }
    );

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    res.json({
      success: true,
      message: '小说更新成功',
      data: { novel }
    });

  } catch (error) {
    console.error('更新小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，更新失败'
    });
  }
});

// 删除小说
router.delete('/:id', auth, async (req, res) => {
  try {
    const novel = await Novel.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    res.json({
      success: true,
      message: '小说删除成功'
    });

  } catch (error) {
    console.error('删除小说错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，删除失败'
    });
  }
});

// 添加分卷
router.post('/:id/volumes', auth, async (req, res) => {
  try {
    const { title, summary } = req.body;

    if (!title || !summary) {
      return res.status(400).json({
        success: false,
        message: '请填写分卷标题和概述'
      });
    }

    const novel = await Novel.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!novel) {
      return res.status(404).json({
        success: false,
        message: '小说不存在'
      });
    }

    const volumeIndex = novel.getNextVolumeIndex();

    novel.volumes.push({
      title,
      summary,
      volumeIndex,
      chapters: []
    });

    await novel.save();

    res.status(201).json({
      success: true,
      message: '分卷添加成功',
      data: {
        volume: novel.volumes[novel.volumes.length - 1]
      }
    });

  } catch (error) {
    console.error('添加分卷错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，添加失败'
    });
  }
});

// 添加章节
router.post('/:id/volumes/:volumeIndex/chapters', auth, async (req, res) => {
  try {
    const { title, summary } = req.body;
    const { id, volumeIndex } = req.params;

    if (!title || !summary) {
      return res.status(400).json({
        success: false,
        message: '请填写章节标题和概述'
      });
    }

    const novel = await Novel.findOne({
      _id: id,
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

    const chapterIndex = novel.getNextChapterIndex(volumeIndex - 1);

    volume.chapters.push({
      title,
      summary,
      chapterIndex,
      content: '',
      isGenerated: false
    });

    await novel.save();

    res.status(201).json({
      success: true,
      message: '章节添加成功',
      data: {
        chapter: volume.chapters[volume.chapters.length - 1]
      }
    });

  } catch (error) {
    console.error('添加章节错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，添加失败'
    });
  }
});

module.exports = router;
