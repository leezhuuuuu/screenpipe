# Screenpipe REST API 完全使用指南

// screenpipe — AI that knows everything you've seen, said, or heard
// https://screenpi.pe

Screenpipe 提供了一个功能丰富的本地 REST API，默认运行在 `http://localhost:3030`。本指南涵盖所有 API 端点的完整使用方法。

## 目录

1. [基础信息](#基础信息)
2. [搜索 API](#搜索-api)
3. [活动摘要](#活动摘要)
4. [UI 元素](#ui-元素)
5. [帧/截图](#帧截图)
6. [音频管理](#音频管理)
7. [会议](#会议)
8. [说话人管理](#说话人管理)
9. [记忆系统](#记忆系统)
10. [数据管理](#数据管理)
11. [流媒体与导出](#流媒体与导出)
12. [同步 API](#同步-api)
13. [归档 API](#归档-api)
14. [Vault 加密](#vault-加密)
15. [Pipe API](#pipe-api)
16. [连接管理](#连接管理)
17. [健康检查与监控](#健康检查与监控)
18. [WebSocket](#websocket)
19. [最佳实践](#最佳实践)

---

## 基础信息

### 基础 URL

```
http://localhost:3030
```

### 认证

目前 API 不需要认证（本地运行）。如需保护 API，请使用网络层限制或代理。

### 通用参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `start_time` | ISO 8601 或相对时间 | 开始时间，支持 `2024-01-15T10:00:00Z`、`1h ago`、`30m ago`、`2d ago` |
| `end_time` | ISO 8601 或相对时间 | 结束时间，默认为 `now` |
| `limit` | integer | 返回结果数量限制 |
| `offset` | integer | 分页偏移量 |

### 相对时间参考

- **"30 分钟内"** = `30m ago`
- **"今天"** = 自午夜起
- **"昨天"** = 昨天的时间范围
- **"最近一小时"** = `1h ago`

### OpenAPI 规范

获取完整的 OpenAPI 规范：
```bash
curl http://localhost:3030/openapi.yaml   # YAML 格式
curl http://localhost:3030/openapi.json  # JSON 格式
```

---

## 搜索 API

### `GET /search`

核心搜索端点，支持多种内容类型的全文搜索。

**请求示例：**
```bash
curl "http://localhost:3030/search?q=QUERY&content_type=all&limit=10&start_time=1h%20ago"
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 否 | 关键词搜索。注意：音频搜索不要使用此参数，转录文本噪声较大 |
| `content_type` | string | 否 | `all`（默认）、`accessibility`、`audio`、`input`、`ocr`、`memory` |
| `limit` | integer | 否 | 最大 1-100，默认 10 |
| `offset` | integer | 否 | 分页偏移，默认 0 |
| `start_time` | string | **是** | 开始时间 |
| `end_time` | string | 否 | 结束时间，默认为 `now` |
| `app_name` | string | 否 | 应用名称，如 "Google Chrome"、"Slack" |
| `window_name` | string | 否 | 窗口标题（子串匹配） |
| `speaker_name` | string | 否 | 按说话人名称过滤（大小写不敏感） |
| `focused` | boolean | 否 | 仅返回聚焦窗口 |
| `browser_url` | string | 否 | 按浏览器 URL 过滤 |
| `max_content_length` | integer | 否 | 截断每个结果的文本长度 |
| `device_name` | string | 否 | 按设备名称过滤 |
| `machine_id` | string | 否 | 按机器 UUID 过滤 |
| `include_cloud` | boolean | 否 | 包含云同步数据 |

**content_type 说明：**

| 类型 | 说明 |
|------|------|
| `all` | 所有类型（默认） |
| `accessibility` | 无障碍树文本（主要屏幕文本来源） |
| `audio` | 音频转录 |
| `input` | 输入事件 |
| `ocr` | OCR 文本（备用方案，用于游戏、远程桌面等） |
| `memory` | 记忆系统数据 |

**响应格式：**
```json
{
  "data": [
    {
      "type": "OCR",
      "content": {
        "frame_id": 12345,
        "text": "...",
        "timestamp": "2024-01-15T10:00:00Z",
        "app_name": "Chrome",
        "window_name": "Gmail - Inbox"
      }
    },
    {
      "type": "Audio",
      "content": {
        "chunk_id": 678,
        "transcription": "...",
        "timestamp": "2024-01-15T10:05:00Z",
        "speaker": {"name": "John"}
      }
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 42
  }
}
```

### `GET /search/keyword`

关键词搜索（简化版本）。

```bash
curl "http://localhost:3030/search/keyword?q=meeting&start_time=1d%20ago"
```

---

## 活动摘要

### `GET /activity-summary`

返回应用使用统计，包括准确的 `active_minutes`、首次/最后使用时间、最近文本、音频摘要。这是回答"我在做什么？"、"哪些应用？"等问题的最佳起点。

**请求示例：**
```bash
curl "http://localhost:3030/activity-summary?start_time=1h%20ago&end_time=now"
```

**响应包含：**
- 每个应用的使用时间（分钟）
- 应用首次和最后使用时间
- 最近捕获的屏幕文本
- 音频摘要统计

---

## UI 元素

### `GET /elements`

轻量级全文搜索 UI 元素（约 100-500 字节每个，相比 `/search` 的 5-20KB 更轻量）。

**请求示例：**
```bash
curl "http://localhost:3030/elements?q=Submit&start_time=1h%20ago&limit=10"
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `q` | string | 搜索关键词 |
| `frame_id` | integer | 按帧 ID 过滤 |
| `source` | string | `accessibility` 或 `ocr` |
| `role` | string | 元素角色（见下文） |
| `start_time` | string | 开始时间 |
| `end_time` | string | 结束时间 |
| `app_name` | string | 应用名称 |
| `limit` | integer | 限制 |
| `offset` | integer | 偏移 |

### `GET /frames/{frame_id}/elements`

获取特定帧的所有 UI 元素。

```bash
curl "http://localhost:3030/frames/12345/elements"
```

### 常见 UI 元素角色

| 概念 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 按钮 | `AXButton` | `Button` | `Button` |
| 静态文本 | `AXStaticText` | `Text` | `Label` |
| 链接 | `AXLink` | `Hyperlink` | `Link` |
| 文本字段 | `AXTextField` | `Edit` | `Entry` |
| 文本区域 | `AXTextArea` | `Document` | `Text` |
| 菜单项 | `AXMenuItem` | `MenuItem` | `MenuItem` |
| 复选框 | `AXCheckBox` | `CheckBox` | `CheckBox` |
| 组 | `AXGroup` | `Group` | `Group` |
| Web 区域 | `AXWebArea` | `Pane` | `DocumentWeb` |
| 标题 | `AXHeading` | `Header` | `Heading` |
| 标签页 | `AXTab` | `TabItem` | `Tab` |
| 列表项 | `AXRow` | `ListItem` | `ListItem` |

OCR 专用角色：`line`、`word`、`block`、`paragraph`、`page`

### UI 元素响应格式

`GET /frames/{frame_id}/elements` 返回结构化的 UI 元素列表：

```json
{
  "data": [
    {
      "id": 16229,
      "frame_id": 447,
      "role": "block",
      "text": "Code",
      "confidence": 1.0,
      "bounds": {
        "left": 0.030523256,
        "top": 0.013392857,
        "width": 0.021802324,
        "height": 0.011160714
      },
      "depth": 0,
      "sort_order": 0,
      "source": "ocr",
      "parent_id": null
    }
  ],
  "pagination": {
    "limit": 21,
    "offset": 0,
    "total": 198
  }
}
```

### 典型元素示例

以下是从实际帧中提取的高置信度（≥ 0.9）元素示例：

| ID | 角色 | 文本内容 | 置信度 |
|----|------|----------|--------|
| 16329 | block | `comprehensive REST API guide for Screenpipe. Let me verify it was written correctly.` | 1.0 |
| 16264 | block | `* BATCH_TRANSCRIPTION_SPEC.md` | 1.0 |
| 16290 | block | `--dangerously-skip-permissions — 162×45` | 1.0 |
| 16388 | block | `/frames/:frame_id/text` | 1.0 |
| 16402 | block | `/memory to view and manage Claude memory` | 1.0 |

**代表性元素分类：**

1. **对话/消息内容** (如 Claude Code 输出)
2. **文件树/目录结构**
3. **命令行/代码片段**
4. **API 端点路径**
5. **快捷键提示**

---

## 帧/截图

### 获取帧列表

有多种方式获取帧列表：

**1. 使用 `/search` 搜索帧**

通过 `content_type` 过滤获取帧：

```bash
# 获取所有帧（配合时间范围）
curl "http://localhost:3030/search?content_type=accessibility&start_time=1h%20ago&limit=50"

# 搜索特定应用的帧
curl "http://localhost:3030/search?app_name=Chrome&start_time=1h%20ago&limit=50"
```

响应中的 `frame_id` 可用于调用 `/frames/{frame_id}` 获取具体截图。

**2. 使用 `/raw_sql` 直接查询**

```bash
# 获取最近的帧列表
curl -X POST http://localhost:3030/raw_sql \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT id, timestamp, app_name, window_name FROM frames ORDER BY timestamp DESC LIMIT 50"}'

# 按应用分组获取帧统计
curl -X POST http://localhost:3030/raw_sql \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT app_name, COUNT(*) as count, MIN(timestamp) as first_seen, MAX(timestamp) as last_seen FROM frames WHERE timestamp > datetime('\''now'\'', '\''-24 hours'\'') GROUP BY app_name ORDER BY count DESC LIMIT 20"}'
```

**3. 使用 `/activity-summary`**

获取应用级别的帧统计（不返回具体帧 ID）：

```bash
curl "http://localhost:3030/activity-summary?start_time=1h%20ago"
```

### `GET /frames/{frame_id}`

获取帧图像（PNG 格式）。

```bash
# 保存到文件
curl -o /tmp/frame.png "http://localhost:3030/frames/12345"

# 带 PII 编辑
curl -o /tmp/frame_redacted.png "http://localhost:3030/frames/12345?redact_pii=true"
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `redact_pii` | boolean | 是否模糊/编辑检测到的 PII（信用卡、SSN、邮箱等） |

**响应：** 原始 PNG/JPEG 二进制数据

### `GET /frames/{frame_id}/text`

获取帧的 OCR 文本。

```bash
curl "http://localhost:3030/frames/12345/text"
```

**响应格式：**
```json
{
  "frame_id": 439,
  "text_positions": [
    {
      "bounds": {
        "height": 0.01882452,
        "left": 0.010102213,
        "top": 0.010677027,
        "width": 0.049563013
      },
      "confidence": 0.5,
      "text": "Typora"
    },
    {
      "bounds": {
        "height": 0.013392856,
        "left": 0.4636628,
        "top": 0.058035716,
        "width": 0.09011628
      },
      "confidence": 1.0,
      "text": "REST_API_GUIDE.md~"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `frame_id` | integer | 帧 ID |
| `text_positions` | array | 文本位置数组 |
| `text_positions[].bounds` | object | 边界框（归一化 0-1 坐标） |
| `text_positions[].confidence` | float | 识别置信度（0-1） |
| `text_positions[].text` | string | 识别出的文本 |

### `POST /frames/{frame_id}/text`

对帧运行 OCR（如果之前没有 OCR）。

```bash
curl -X POST "http://localhost:3030/frames/12345/text"
```

**响应格式：** 与 `GET /frames/{frame_id}/text` 相同

### `GET /frames/{frame_id}/context`

获取帧的上下文信息，包括无障碍文本、解析的节点和提取的 URL。

```bash
curl "http://localhost:3030/frames/12345/context"
```

**响应格式：**
```json
{
  "frame_id": 439,
  "text": "合并的纯文本内容，所有文本按位置顺序拼接...",
  "text_source": "accessibility",
  "urls": [
    "http://localhost:3030/ai/status",
    "http://localhost:3030/ai/chat/completions"
  ],
  "nodes": []
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `frame_id` | integer | 帧 ID |
| `text` | string | 合并的纯文本内容（去除了格式） |
| `text_source` | string | 文本来源：`accessibility`（无障碍树）或 `ocr` |
| `urls` | array | 从文本中提取的 URL |
| `nodes` | array | 结构化的 DOM 节点（如果有） |

### `GET /frames/{frame_id}/metadata`

获取帧的元数据。

```bash
curl "http://localhost:3030/frames/12345/metadata"
```

**响应格式：**
```json
{
  "frame_id": 447,
  "timestamp": "2026-04-01T20:51:15.637923+08:00"
}
```

**如需更多元数据字段，使用 SQL 查询：**

```bash
curl -X POST http://localhost:3030/raw_sql \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT id, timestamp, app_name, window_name, browser_url, focused, device_name, text_source, capture_trigger FROM frames WHERE id = 447 LIMIT 1"}'
```

**响应：**
```json
[
  {
    "id": 447,
    "timestamp": "2026-04-01T20:51:15.637923+08:00",
    "app_name": "",
    "window_name": "",
    "browser_url": "",
    "focused": 1,
    "device_name": "monitor_1",
    "text_source": "ocr",
    "capture_trigger": "visual_change"
  }
]
```

**frames 表完整字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 帧 ID（主键） |
| `timestamp` | TIMESTAMP | 时间戳 |
| `app_name` | TEXT | 应用名称 |
| `window_name` | TEXT | 窗口标题 |
| `browser_url` | TEXT | 浏览器 URL |
| `focused` | BOOLEAN | 是否聚焦窗口 |
| `device_name` | TEXT | 设备名称（如 `monitor_1`） |
| `text_source` | TEXT | 文本来源：`ocr` 或 `accessibility` |
| `capture_trigger` | TEXT | 捕获触发条件：`visual_change`、`audio` 等 |
| `video_chunk_id` | INTEGER | 关联的视频块 ID |
| `offset_index` | INTEGER | 帧在视频中的偏移索引 |
| `name` | TEXT | 帧文件名 |
| `sync_id` | TEXT | 同步 ID |
| `machine_id` | TEXT | 机器 UUID |
| `snapshot_path` | TEXT | 快照路径 |
| `content_hash` | INTEGER | 内容哈希 |
| `simhash` | INTEGER | 相似度哈希 |

### `GET /frames/{frame_id}/elements`

获取特定帧的所有 UI 元素。

```bash
curl "http://localhost:3030/frames/12345/elements"
```

**响应格式：**
```json
{
  "data": [
    {
      "id": 16229,
      "frame_id": 447,
      "role": "block",
      "text": "Code",
      "confidence": 1.0,
      "bounds": {
        "height": 0.01116071,
        "left": 0.03052325,
        "top": 0.01339285,
        "width": 0.02180232
      },
      "depth": 0,
      "sort_order": 0,
      "source": "ocr",
      "parent_id": null
    },
    {
      "id": 16329,
      "frame_id": 447,
      "role": "block",
      "text": "comprehensive REST API guide for Screenpipe. Let me verify it was written correctly.",
      "confidence": 1.0,
      "bounds": { "left": 0.07, "top": 0.22, "width": 0.22, "height": 0.02 },
      "depth": 0,
      "sort_order": 28,
      "source": "ocr",
      "parent_id": null
    }
  ],
  "pagination": {
    "limit": 21,
    "offset": 0,
    "total": 198
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 元素 ID |
| `frame_id` | integer | 所属帧 ID |
| `role` | string | 元素角色（如 `block`、`line`、`word`） |
| `text` | string | 元素文本内容 |
| `confidence` | float | 识别置信度（0-1） |
| `bounds` | object | 边界框（归一化坐标） |
| `depth` | integer | DOM 树深度 |
| `sort_order` | integer | 排序顺序 |
| `source` | string | 来源：`ocr` 或 `accessibility` |
| `parent_id` | integer | 父元素 ID（null 表示根元素） |

**高置信度元素筛选示例：**

```bash
# 获取置信度 >= 0.9 的元素
curl -s "http://localhost:3030/frames/447/elements" | jq '[.data[] | select(.confidence >= 0.9) | {id, role, text, confidence}]'
```

### `GET /frames/next-valid`

获取指定时间之后的下一个有效帧。

```bash
curl "http://localhost:3030/frames/next-valid?start_time=2024-01-15T10:00:00Z"
```

---

## 音频管理

### `GET /audio/list`

列出可用的音频设备。

```bash
curl "http://localhost:3030/audio/list"
```

### `POST /audio/start`

开始音频捕获。

```bash
curl -X POST "http://localhost:3030/audio/start"
```

### `POST /audio/stop`

停止音频捕获。

```bash
curl -X POST "http://localhost:3030/audio/stop"
```

### `POST /audio/device/start`

启动特定音频设备。

```bash
curl -X POST "http://localhost:3030/audio/device/start" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "device_uuid"}'
```

### `POST /audio/device/stop`

停止特定音频设备。

```bash
curl -X POST "http://localhost:3030/audio/device/stop" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "device_uuid"}'
```

### `POST /audio/retranscribe`

重新转录指定时间范围内的音频。

```bash
curl -X POST http://localhost:3030/audio/retranscribe \
  -H "Content-Type: application/json" \
  -d '{"start": "1h ago", "end": "now"}'
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `start` | string | 开始时间 |
| `end` | string | 结束时间 |
| `engine` | string | 转录引擎：`whisper-large-v3-turbo`、`whisper-large-v3`、`deepgram`、`qwen3-asar` |
| `vocabulary` | array | 词汇替换/偏置，`[{"word": "...", "replacement": "..."}]` |
| `prompt` | string | 主题上下文提示 |

**建议：**
- 保持时间范围在 1 小时以内
- 引擎选择：`whisper-large-v3-turbo`（快速）、`whisper-large-v3`（高质量）

---

## 会议

### `GET /meetings`

列出会议。

```bash
curl "http://localhost:3030/meetings?start_time=1d%20ago&end_time=now&limit=10&offset=0"
```

### `GET /meetings/{id}`

获取特定会议详情。

```bash
curl "http://localhost:3030/meetings/42"
```

### `GET /meetings/status`

获取会议检测状态。

```bash
curl "http://localhost:3030/meetings/status"
```

### `POST /meetings/start`

手动开始一个会议。

```bash
curl -X POST "http://localhost:3030/meetings/start"
```

### `POST /meetings/stop`

手动停止当前会议。

```bash
curl -X POST "http://localhost:3030/meetings/stop"
```

### `POST /meetings/merge`

合并会议。

```bash
curl -X POST "http://localhost:3030/meetings/merge" \
  -H "Content-Type: application/json" \
  -d '{"meeting_ids": [1, 2, 3]}'
```

### `POST /meetings/bulk-delete`

批量删除会议。

```bash
curl -X POST "http://localhost:3030/meetings/bulk-delete" \
  -H "Content-Type: application/json" \
  -d '{"meeting_ids": [1, 2, 3]}'
```

### `PUT /meetings/{id}`

更新会议信息。

```bash
curl -X PUT "http://localhost:3030/meetings/42" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "attendees": "John, Jane"}'
```

### `DELETE /meetings/{id}`

删除会议。

```bash
curl -X DELETE "http://localhost:3030/meetings/42"
```

**会议响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 会议 ID |
| `meeting_start` | ISO 8601 | 开始时间 |
| `meeting_end` | ISO 8601 | 结束时间（进行中时为 null） |
| `meeting_app` | string | 应用（zoom、teams、meet 等） |
| `title` | string | 会议标题 |
| `attendees` | string | 参会者 |
| `detection_source` | string | 检测来源（`app`、`calendar`、`ui`、`audio`） |

---

## 说话人管理

### `GET /speakers/search`

按名称搜索说话人。

```bash
curl "http://localhost:3030/speakers/search?name=John"
```

### `GET /speakers/unnamed`

获取未命名的说话人（用于标记）。

```bash
curl "http://localhost:3030/speakers/unnamed?limit=20&offset=0"
```

### `GET /speakers/similar`

查找相似的说话人（基于语音嵌入）。

```bash
curl "http://localhost:3030/speakers/similar?speaker_id=29&limit=5"
```

### `POST /speakers/update`

更新说话人名称/元数据。

```bash
curl -X POST http://localhost:3030/speakers/update \
  -H "Content-Type: application/json" \
  -d '{"id": 29, "name": "Jordan"}'
```

### `POST /speakers/reassign`

重新分配说话人（用于修正识别错误）。

```bash
curl -X POST http://localhost:3030/speakers/reassign \
  -H "Content-Type: application/json" \
  -d '{"audio_chunk_id": 456, "new_speaker_name": "Jordan", "propagate_similar": true}'
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `audio_chunk_id` | integer | 音频块 ID |
| `new_speaker_name` | string | 新说话人名称 |
| `propagate_similar` | boolean | 是否同时修复相似片段（默认 true） |

**返回：**
```json
{
  "new_speaker_id": 30,
  "transcriptions_updated": 15,
  "old_assignments": [...]
}
```

### `POST /speakers/undo-reassign`

撤销说话人重新分配。

```bash
curl -X POST http://localhost:3030/speakers/undo-reassign \
  -H "Content-Type: application/json" \
  -d '{"old_assignments": [{"transcription_id": 1, "old_speaker_id": 29}]}'
```

### `POST /speakers/merge`

合并两个说话人。

```bash
curl -X POST http://localhost:3030/speakers/merge \
  -H "Content-Type: application/json" \
  -d '{"speaker_to_keep_id": 5, "speaker_to_merge_id": 29}'
```

### `POST /speakers/hallucination`

将说话人标记为幻觉（错误检测）。

```bash
curl -X POST http://localhost:3030/speakers/hallucination \
  -H "Content-Type: application/json" \
  -d '{"speaker_id": 29}'
```

### `POST /speakers/delete`

删除说话人（同时删除关联的音频文件）。

```bash
curl -X POST http://localhost:3030/speakers/delete \
  -H "Content-Type: application/json" \
  -d '{"id": 29}'
```

---

## 记忆系统

记忆系统用于存储和检索持久化的事实和偏好设置。

### `POST /memories`

创建记忆。

```bash
curl -X POST http://localhost:3030/memories \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers dark mode", "source": "user", "tags": ["preference", "ui"], "importance": 0.7}'
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | string | **是** | 记忆内容 |
| `source` | string | 否 | 来源：`user`、`system`、`inferred` |
| `tags` | array | 否 | 标签数组 |
| `importance` | float | 否 | 重要性（0.0-1.0） |

### `GET /memories`

列出/搜索记忆。

```bash
curl "http://localhost:3030/memories?q=preference&limit=10"
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `q` | string | 全文搜索 |
| `source` | string | 按来源过滤 |
| `tags` | string | 按标签过滤（逗号分隔） |
| `min_importance` | float | 最小重要性 |
| `start_time` | string | 开始时间 |
| `end_time` | string | 结束时间 |
| `limit` | integer | 限制 |
| `offset` | integer | 偏移 |

### `GET /memories/{id}`

获取特定记忆。

```bash
curl "http://localhost:3030/memories/1"
```

### `PUT /memories/{id}`

更新记忆。

```bash
curl -X PUT http://localhost:3030/memories/1 \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers dark mode in all apps", "importance": 0.8}'
```

### `DELETE /memories/{id}`

删除记忆。

```bash
curl -X DELETE "http://localhost:3030/memories/1"
```

---

## 数据管理

### `POST /raw_sql`

执行原始 SQL 查询。

```bash
curl -X POST http://localhost:3030/raw_sql \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM frames LIMIT 10"}'
```

**重要规则：**
- 每个 SELECT 必须包含 LIMIT
- 必须按时间过滤
- 只读查询
- 使用 `datetime('now', '-24 hours')` 进行时间计算

**数据库表结构：**

| 表名 | 关键列 | 时间列 |
|------|--------|--------|
| `frames` | `app_name`, `window_name`, `browser_url`, `focused` | `timestamp` |
| `ocr_text` | `text`, `app_name`, `window_name` | 通过 `frame_id` 关联 |
| `elements` | `source`, `role`, `text`, `bounds_*` | 通过 `frame_id` 关联 |
| `audio_transcriptions` | `transcription`, `device`, `speaker_id`, `is_input_device` | `timestamp` |
| `audio_chunks` | `file_path` | `timestamp` |
| `speakers` | `name`, `metadata` | - |
| `ui_events` | `event_type`, `app_name`, `window_title`, `browser_url` | `timestamp` |
| `accessibility` | `app_name`, `window_name`, `text_content`, `browser_url` | `timestamp` |
| `meetings` | `meeting_app`, `title`, `attendees`, `detection_source` | `meeting_start` |
| `memories` | `content`, `source`, `tags`, `importance` | `created_at` |

**frames 表完整字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 帧 ID（主键） |
| `timestamp` | TIMESTAMP | 捕获时间 |
| `app_name` | TEXT | 应用名称 |
| `window_name` | TEXT | 窗口标题 |
| `browser_url` | TEXT | 浏览器 URL |
| `focused` | BOOLEAN | 是否聚焦窗口 |
| `device_name` | TEXT | 设备名称（如 `monitor_1`） |
| `text_source` | TEXT | 文本来源：`ocr` 或 `accessibility` |
| `capture_trigger` | TEXT | 捕获触发：`visual_change`、`audio` 等 |
| `video_chunk_id` | INTEGER | 关联视频块 ID |
| `offset_index` | INTEGER | 帧在视频中的偏移 |
| `name` | TEXT | 帧文件名 |
| `sync_id` | TEXT | 同步 ID |
| `machine_id` | TEXT | 机器 UUID |
| `snapshot_path` | TEXT | 快照路径 |
| `content_hash` | INTEGER | 内容哈希 |
| `simhash` | INTEGER | 相似度哈希 |
| `cloud_blob_id` | TEXT | 云存储 ID |
| `full_text` | TEXT | 完整文本 |
| `elements_ref_frame_id` | INTEGER | 元素引用帧 ID |

**查询帧元数据示例：**

```bash
# 获取帧基本信息
curl -X POST http://localhost:3030/raw_sql \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT id, timestamp, app_name, window_name, focused, device_name, text_source, capture_trigger FROM frames WHERE id = 447 LIMIT 1"}'

# 获取今日所有帧的时间范围
curl -X POST http://localhost:3030/raw_sql \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT MIN(timestamp) as earliest, MAX(timestamp) as latest, COUNT(*) as total FROM frames WHERE date(timestamp) = '\''2026-04-01'\'' LIMIT 1"}'
```

**示例查询：**

```sql
-- 最近 24 小时最常用的应用
SELECT app_name, COUNT(*) as frames FROM frames
WHERE timestamp > datetime('now', '-24 hours') AND app_name IS NOT NULL
GROUP BY app_name ORDER BY frames DESC LIMIT 20

-- 最近访问的域名
SELECT CASE WHEN INSTR(SUBSTR(browser_url, INSTR(browser_url, '://') + 3), '/') > 0
  THEN SUBSTR(SUBSTR(browser_url, INSTR(browser_url, '://') + 3), 1, INSTR(SUBSTR(browser_url, INSTR(browser_url, '://') + 3), '/') - 1)
  ELSE SUBSTR(browser_url, INSTR(browser_url, '://') + 3) END as domain,
COUNT(*) as visits FROM frames
WHERE timestamp > datetime('now', '-24 hours') AND browser_url IS NOT NULL
GROUP BY domain ORDER BY visits DESC LIMIT 20

-- 说话人统计
SELECT COALESCE(NULLIF(s.name, ''), 'Unknown') as speaker, COUNT(*) as segments
FROM audio_transcriptions at LEFT JOIN speakers s ON at.speaker_id = s.id
WHERE at.timestamp > datetime('now', '-24 hours')
GROUP BY at.speaker_id ORDER BY segments DESC LIMIT 20

-- 每小时上下文切换
SELECT strftime('%H:00', timestamp) as hour, COUNT(*) as switches
FROM ui_events WHERE event_type = 'app_switch' AND timestamp > datetime('now', '-24 hours')
GROUP BY hour ORDER BY hour LIMIT 24
```

### `POST /add`

添加数据到数据库。

```bash
curl -X POST "http://localhost:3030/add" \
  -H "Content-Type: application/json" \
  -d '{"type": "memory", "data": {...}}'
```

### `POST /data/delete-range`

删除时间范围内的数据。

```bash
curl -X POST "http://localhost:3030/data/delete-range" \
  -H "Content-Type: application/json" \
  -d '{"start_time": "2024-01-01T00:00:00Z", "end_time": "2024-01-02T00:00:00Z"}'
```

### `POST /data/delete-device`

删除特定设备的数据。

```bash
curl -X POST "http://localhost:3030/data/delete-device" \
  -H "Content-Type: application/json" \
  -d '{"device_id": "device_uuid"}'
```

### `GET /data/device-storage`

获取设备存储信息。

```bash
curl "http://localhost:3030/data/device-storage"
```

---

## 流媒体与导出

### `POST /frames/export`

导出一系列帧为视频。

```bash
curl -X POST http://localhost:3030/frames/export \
  -H "Content-Type: application/json" \
  -d '{"start_time": "5m ago", "end_time": "now", "fps": 1.0}'
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `start_time` | string | 开始时间 |
| `end_time` | string | 结束时间 |
| `frame_ids` | array | 指定帧 ID 数组（与时间范围二选一） |
| `fps` | float | 帧率，默认 1.0 |

**FPS 指南：**

| 时长 | 建议 FPS |
|------|----------|
| 5 分钟 | 1.0 |
| 30 分钟 | 0.5 |
| 1 小时 | 0.2 |
| 2 小时以上 | 0.1 |

**最大 10,000 帧**

**响应：**
```json
{
  "file_path": "/path/to/export.mp4",
  "frame_count": 300,
  "duration_secs": 300
}
```

### `GET /frames/export` (WebSocket)

通过 WebSocket 导出帧。

### `GET /stream/frames`

流式获取帧。

---

## 同步 API

### `POST /sync/init`

初始化同步。

```bash
curl -X POST "http://localhost:3030/sync/init" \
  -H "Content-Type: application/json" \
  -d '{"sync_type": "full"}'
```

### `GET /sync/status`

获取同步状态。

```bash
curl "http://localhost:3030/sync/status"
```

### `POST /sync/trigger`

触发同步。

```bash
curl -X POST "http://localhost:3030/sync/trigger"
```

### `POST /sync/lock`

锁定同步。

```bash
curl -X POST "http://localhost:3030/sync/lock"
```

### `POST /sync/download`

下载同步数据。

```bash
curl -X POST "http://localhost:3030/sync/download"
```

### `POST /sync/pipes/push`

推送 Pipe 配置。

```bash
curl -X POST "http://localhost:3030/sync/pipes/push"
```

### `POST /sync/pipes/pull`

拉取 Pipe 配置。

```bash
curl -X POST "http://localhost:3030/sync/pipes/pull"
```

---

## 归档 API

### `POST /archive/init`

初始化归档。

```bash
curl -X POST "http://localhost:3030/archive/init" \
  -H "Content-Type: application/json" \
  -d '{"provider": "s3", "config": {...}}'
```

### `POST /archive/configure`

配置归档。

```bash
curl -X POST "http://localhost:3030/archive/configure" \
  -H "Content-Type: application/json" \
  -d '{"retention_days": 90}'
```

### `GET /archive/status`

获取归档状态。

```bash
curl "http://localhost:3030/archive/status"
```

### `POST /archive/run`

运行归档。

```bash
curl -X POST "http://localhost:3030/archive/run"
```

---

## Vault 加密

Vault 用于加密静态数据。

### `GET /vault/status`

获取 Vault 状态。

```bash
curl "http://localhost:3030/vault/status"
```

### `POST /vault/setup`

设置 Vault。

```bash
curl -X POST "http://localhost:3030/vault/setup" \
  -H "Content-Type: application/json" \
  -d '{"password": "your_password"}'
```

### `POST /vault/lock`

锁定 Vault。

```bash
curl -X POST "http://localhost:3030/vault/lock"
```

### `POST /vault/unlock`

解锁 Vault。

```bash
curl -X POST "http://localhost:3030/vault/unlock" \
  -H "Content-Type: application/json" \
  -d '{"password": "your_password"}'
```

---

## Pipe API

Pipe 是 Screenpipe 的扩展系统，允许执行自定义处理逻辑。

### `GET /pipes`

列出所有已安装的 Pipes。

```bash
curl "http://localhost:3030/pipes"
```

### `POST /pipes/install`

安装 Pipe。

```bash
curl -X POST "http://localhost:3030/pipes/install" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-pipe", "source": "github"}'
```

### `GET /pipes/{id}`

获取特定 Pipe 信息。

```bash
curl "http://localhost:3030/pipes/pipe_id"
```

### `DELETE /pipes/{id}`

删除 Pipe。

```bash
curl -X DELETE "http://localhost:3030/pipes/pipe_id"
```

### `POST /pipes/{id}/enable`

启用 Pipe。

```bash
curl -X POST "http://localhost:3030/pipes/pipe_id/enable"
```

### `POST /pipes/{id}/run`

立即运行 Pipe。

```bash
curl -X POST "http://localhost:3030/pipes/pipe_id/run"
```

### `GET /pipes/{id}/logs`

获取 Pipe 日志。

```bash
curl "http://localhost:3030/pipes/pipe_id/logs"
```

### `POST /pipes/{id}/config`

更新 Pipe 配置。

```bash
curl -X POST "http://localhost:3030/pipes/pipe_id/config" \
  -H "Content-Type: application/json" \
  -d '{"setting": "value"}'
```

### `POST /pipes/{id}/stop`

停止 Pipe。

```bash
curl -X POST "http://localhost:3030/pipes/pipe_id/stop"
```

### `GET /pipes/{id}/executions`

获取 Pipe 执行历史。

```bash
curl "http://localhost:3030/pipes/pipe_id/executions"
```

### `DELETE /pipes/{id}/history`

清除 Pipe 历史。

```bash
curl -X DELETE "http://localhost:3030/pipes/pipe_id/history"
```

### `GET /pipes/{id}/session/{exec_id}`

获取 Pipe 会话详情。

```bash
curl "http://localhost:3030/pipes/pipe_id/session/exec_123"
```

### Pipe Store 端点

```bash
GET  /pipes/store              # 搜索 Store 中的 Pipes
POST /pipes/store/publish      # 发布 Pipe 到 Store
POST /pipes/store/install      # 从 Store 安装
POST /pipes/store/update       # 更新 Pipe
GET  /pipes/store/check-updates # 检查更新
GET  /pipes/store/{slug}       # 获取 Pipe 详情
DELETE /pipes/store/{slug}     # 从 Store 取消发布
POST /pipes/store/{slug}/review # 评价 Pipe
```

---

## 连接管理

连接管理用于集成外部服务（Telegram、Slack、Discord、Email、Todoist、Teams）。

### `GET /connections`

列出所有连接。

```bash
curl "http://localhost:3030/connections"
```

### `GET /connections/{service}`

获取特定服务的凭证。

```bash
curl "http://localhost:3030/connections/telegram"
```

**服务类型：** `telegram`、`slack`、`discord`、`email`、`todoist`、`teams`

**返回的凭证示例：**

| 服务 | 字段 | 用途 |
|------|------|------|
| Telegram | `bot_token`, `chat_id` | `POST https://api.telegram.org/bot{token}/sendMessage` |
| Slack | `webhook_url` | `POST {webhook_url}` with `{"text": "..."}` |
| Discord | `webhook_url` | `POST {webhook_url}` with `{"content": "..."}` |
| Todoist | `api_token` | `POST https://api.todoist.com/api/v1/tasks` with Bearer auth |
| Teams | `webhook_url` | `POST {webhook_url}` with `{"text": "..."}` |
| Email | `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `from_address` | SMTP 发送 |

如未连接，请前往 Settings > Connections 进行设置。

---

## 健康检查与监控

### `GET /health`

健康检查端点。

```bash
curl "http://localhost:3030/health"
```

### `GET /vision/status`

获取视觉管道状态。

```bash
curl "http://localhost:3030/vision/status"
```

### `GET /vision/list`

列出所有显示器。

```bash
curl "http://localhost:3030/vision/list"
```

### `GET /vision/metrics`

获取视觉管道指标。

```bash
curl "http://localhost:3030/vision/metrics"
```

### `GET /audio/metrics`

获取音频管道指标。

```bash
curl "http://localhost:3030/audio/metrics"
```

---

## WebSocket

### `GET /ws/events`

WebSocket 事件流。

```javascript
// 客户端示例
const ws = new WebSocket('ws://localhost:3030/ws/events');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

### `GET /ws/health`

WebSocket 健康检查。

```javascript
const ws = new WebSocket('ws://localhost:3030/ws/health');
```

### `GET /ws/metrics`

WebSocket 指标流。

```javascript
const ws = new WebSocket('ws://localhost:3030/ws/metrics');
```

### 浏览器扩展桥接

```bash
GET  /browser/ws       # 浏览器扩展 WebSocket
POST /browser/eval     # 在浏览器中执行 JavaScript
GET  /browser/status   # 浏览器扩展状态
```

---

## 数据保留

### `POST /retention/configure`

配置数据保留策略。

```bash
curl -X POST "http://localhost:3030/retention/configure" \
  -H "Content-Type: application/json" \
  -d '{"retention_days": 30, "auto_delete": true}'
```

### `GET /retention/status`

获取保留状态。

```bash
curl "http://localhost:3030/retention/status"
```

### `POST /retention/run`

运行保留清理。

```bash
curl -X POST "http://localhost:3030/retention/run"
```

---

## 电源管理

### `GET /power`

获取电源状态。

```bash
curl "http://localhost:3030/power"
```

### `POST /power`

设置电源模式。

```bash
curl -X POST "http://localhost:3030/power" \
  -H "Content-Type: application/json" \
  -d '{"mode": "low_power"}'
```

---

## 标签管理

### `POST /tags/{content_type}/{id}`

为内容添加标签。

```bash
curl -X POST "http://localhost:3030/tags/frame/12345" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["important", "meeting"]}'
```

### `DELETE /tags/{content_type}/{id}`

移除标签。

```bash
curl -X DELETE "http://localhost:3030/tags/frame/12345?tags=important"
```

### `POST /tags/vision/batch`

批量获取标签。

```bash
curl -X POST "http://localhost:3030/tags/vision/batch" \
  -H "Content-Type: application/json" \
  -d '{"frame_ids": [1, 2, 3]}'
```

---

## 实验性功能

### `POST /experimental/frames/merge`

合并帧。

```bash
curl -X POST "http://localhost:3030/experimental/frames/merge" \
  -H "Content-Type: application/json" \
  -d '{"frame_ids": [1, 2, 3]}'
```

### `GET /experimental/validate/media`

验证媒体。

```bash
curl "http://localhost:3030/experimental/validate/media?frame_id=123"
```

---

## Apple Intelligence (macOS)

仅在启用 `apple-intelligence` 特性时可用。

### `GET /ai/status`

AI 状态。

```bash
curl "http://localhost:3030/ai/status"
```

### `POST /ai/chat/completions`

OpenAI 兼容的 Chat Completions 端点。

```bash
curl -X POST "http://localhost:3030/ai/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model": "apple", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## 端点返回数据对比

### 帧相关端点返回数据对比

| 端点 | 返回内容 | 数据格式 | 适用场景 |
|------|----------|----------|----------|
| `GET /frames/{id}` | 原始图像 | PNG/JPEG 二进制 | 可视化、下载 |
| `GET /frames/{id}/text` | 带位置的文本片段 | JSON + text_positions 数组 | 精确定位文本、分析布局 |
| `POST /frames/{id}/text` | 带位置的文本片段 | JSON + text_positions 数组 | 对未 OCR 的帧执行 OCR |
| `GET /frames/{id}/elements` | 结构化 UI 元素 | JSON + data 数组 | 分析界面组件、构建 UI 树 |
| `GET /frames/{id}/context` | 合并文本 + URL | JSON + text + urls | 快速了解帧内容、提取链接 |
| `GET /frames/{id}/metadata` | 时间戳 | JSON | 时间定位、索引 |

### 主要数据获取端点对比

| 端点 | 返回内容 | 数据格式 | 适用场景 |
|------|----------|----------|----------|
| `GET /search` | 多类型搜索结果 | JSON + data 数组 | 内容检索、跨类型搜索 |
| `GET /activity-summary` | 应用使用统计 | JSON + apps 数组 | 行为分析、时间统计 |
| `GET /elements` | UI 元素搜索 | JSON + data 数组 | 查找特定 UI 组件 |
| `POST /raw_sql` | 原始数据库数据 | JSON 数组 | 深度查询、自定义分析 |
| `GET /health` | 系统健康状态 | JSON | 系统监控 |

### 各端点典型响应示例

**1. `GET /frames/{frame_id}`**
```
→ 返回原始 PNG/JPEG 二进制数据（无 JSON）
```

**2. `GET /frames/{frame_id}/text`**
```json
{
  "frame_id": 439,
  "text_positions": [
    {"bounds": {...}, "confidence": 0.5, "text": "Typora"},
    {"bounds": {...}, "confidence": 1.0, "text": "REST_API_GUIDE.md~"}
  ]
}
```

**3. `GET /frames/{frame_id}/elements`**
```json
{
  "data": [
    {"id": 16229, "role": "block", "text": "Code", "confidence": 1.0, "bounds": {...}},
    {"id": 16329, "role": "block", "text": "comprehensive REST API guide...", "confidence": 1.0, "bounds": {...}}
  ],
  "pagination": {"limit": 21, "offset": 0, "total": 198}
}
```

**4. `GET /frames/{frame_id}/context`**
```json
{
  "frame_id": 439,
  "text": "合并的纯文本内容...",
  "text_source": "accessibility",
  "urls": ["http://localhost:3030/ai/status"],
  "nodes": []
}
```

**5. `GET /frames/{frame_id}/metadata`**
```json
{
  "frame_id": 439,
  "timestamp": "2026-04-01T20:50:33.176302+08:00"
}
```

**6. `GET /search`**
```json
{
  "data": [
    {"type": "OCR", "content": {"frame_id": 439, "text": "...", "timestamp": "...", "app_name": "Chrome"}},
    {"type": "Audio", "content": {"chunk_id": 678, "transcription": "...", "speaker": {"name": "John"}}}
  ],
  "pagination": {"limit": 10, "offset": 0, "total": 42}
}
```

**7. `GET /activity-summary`**
```json
{
  "apps": [
    {"name": "Chrome", "active_minutes": 45, "first_seen": "...", "last_seen": "...", "recent_texts": [...]}
  ],
  "total_active_minutes": 120
}
```

**8. `POST /raw_sql`**
```json
[
  {"id": 447, "timestamp": "2026-04-01T20:51:15Z", "app_name": "", "focused": 1, "device_name": "monitor_1"}
]
```

---

## 最佳实践

### 1. 始终包含时间范围

```bash
# 错误 - 可能超时
curl "http://localhost:3030/search?q=meeting"

# 正确
curl "http://localhost:3030/search?q=meeting&start_time=1h%20ago"
```

### 2. 使用渐进式查询

| 问题类型 | 建议端点 |
|----------|----------|
| "我在做什么？" | `/activity-summary` |
| "某个应用用了多久？" | `/activity-summary` |
| "搜索特定内容" | `/search` |
| "查找特定 UI 元素" | `/elements` |
| "查看截图" | `/frames/{id}` |

### 3. 限制结果数量

初始查询使用较小的 `limit`（如 5-10），仅在需要时增加。

### 4. 上下文窗口保护

API 响应可能很大。对于超过 5KB 的响应：
```bash
curl "..." -o /tmp/result.json
wc -c /tmp/result.json  # 检查大小
head -100 /tmp/result.json  # 只读取前几行
jq '.data[0]' /tmp/result.json  # 用 jq 提取需要的内容
```

### 5. 帧导出 FPS 指南

| 时长 | FPS | 帧数 |
|------|-----|------|
| 5 分钟 | 1.0 | ~300 |
| 30 分钟 | 0.5 | ~900 |
| 1 小时 | 0.2 | ~720 |
| 2 小时 | 0.1 | ~720 |

### 6. 音频重新转录

- 保持时间范围在 1 小时以内
- 使用 `vocabulary` 参数来修正已知术语
- 使用 `prompt` 提供主题上下文

### 7. 说话人管理

当用户说"那是 Jordan，不是 Karishma"时：
1. 搜索音频找到 `chunk_id`
2. 调用 `POST /speakers/reassign`
3. 使用 `propagate_similar: true` 自动修复相似片段

### 8. 深度链接

在文档或通知中引用特定时刻：
```markdown
[10:30 AM — Chrome](screenpipe://frame/12345)           # 屏幕文本（使用 frame_id）
[下午 3pm 的会议](screenpipe://timeline?timestamp=2024-01-15T15:00:00Z)  # 音频（使用时间戳）
```

---

## 错误处理

### 常见错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 410 | 帧在远程设备上（云同步场景） |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "error": "Frame is on a remote device",
  "error_type": "remote_device",
  "frame_id": 12345,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 完整端点列表

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/search` | 全文搜索 |
| GET | `/search/keyword` | 关键词搜索 |
| GET | `/activity-summary` | 活动摘要 |
| GET | `/elements` | UI 元素搜索 |
| GET | `/frames/:frame_id` | 获取帧图像 |
| GET | `/frames/:frame_id/text` | 获取帧文本 |
| POST | `/frames/:frame_id/text` | 运行 OCR |
| GET | `/frames/:frame_id/context` | 获取帧上下文 |
| GET | `/frames/:frame_id/metadata` | 获取帧元数据 |
| GET | `/frames/:frame_id/elements` | 获取帧 UI 元素 |
| GET | `/frames/next-valid` | 获取下一个有效帧 |
| POST | `/frames/export` | 导出帧为视频 |
| GET | `/audio/list` | 列出音频设备 |
| POST | `/audio/start` | 开始音频捕获 |
| POST | `/audio/stop` | 停止音频捕获 |
| POST | `/audio/device/start` | 启动音频设备 |
| POST | `/audio/device/stop` | 停止音频设备 |
| POST | `/audio/retranscribe` | 重新转录音频 |
| GET | `/meetings` | 列出会议 |
| GET | `/meetings/:id` | 获取会议详情 |
| GET | `/meetings/status` | 会议状态 |
| POST | `/meetings/start` | 开始会议 |
| POST | `/meetings/stop` | 停止会议 |
| POST | `/meetings/merge` | 合并会议 |
| POST | `/meetings/bulk-delete` | 批量删除会议 |
| PUT | `/meetings/:id` | 更新会议 |
| DELETE | `/meetings/:id` | 删除会议 |
| GET | `/speakers/search` | 搜索说话人 |
| GET | `/speakers/unnamed` | 获取未命名说话人 |
| GET | `/speakers/similar` | 查找相似说话人 |
| POST | `/speakers/update` | 更新说话人 |
| POST | `/speakers/reassign` | 重新分配说话人 |
| POST | `/speakers/undo-reassign` | 撤销重新分配 |
| POST | `/speakers/merge` | 合并说话人 |
| POST | `/speakers/hallucination` | 标记为幻觉 |
| POST | `/speakers/delete` | 删除说话人 |
| POST | `/memories` | 创建记忆 |
| GET | `/memories` | 列出记忆 |
| GET | `/memories/:id` | 获取记忆 |
| PUT | `/memories/:id` | 更新记忆 |
| DELETE | `/memories/:id` | 删除记忆 |
| POST | `/raw_sql` | 执行 SQL |
| POST | `/add` | 添加数据 |
| POST | `/data/delete-range` | 删除时间范围数据 |
| POST | `/data/delete-device` | 删除设备数据 |
| GET | `/data/device-storage` | 设备存储信息 |
| POST | `/frames/export` | 导出视频 |
| GET | `/stream/frames` | 流式帧 |
| GET | `/ws/events` | WebSocket 事件 |
| GET | `/ws/health` | WebSocket 健康 |
| GET | `/ws/metrics` | WebSocket 指标 |
| GET | `/vault/status` | Vault 状态 |
| POST | `/vault/setup` | 设置 Vault |
| POST | `/vault/lock` | 锁定 Vault |
| POST | `/vault/unlock` | 解锁 Vault |
| POST | `/sync/init` | 初始化同步 |
| GET | `/sync/status` | 同步状态 |
| POST | `/sync/trigger` | 触发同步 |
| POST | `/sync/lock` | 锁定同步 |
| POST | `/sync/download` | 下载同步数据 |
| POST | `/sync/pipes/push` | 推送 Pipes |
| POST | `/sync/pipes/pull` | 拉取 Pipes |
| POST | `/archive/init` | 初始化归档 |
| POST | `/archive/configure` | 配置归档 |
| GET | `/archive/status` | 归档状态 |
| POST | `/archive/run` | 运行归档 |
| POST | `/retention/configure` | 配置保留 |
| GET | `/retention/status` | 保留状态 |
| POST | `/retention/run` | 运行保留清理 |
| GET | `/power` | 电源状态 |
| POST | `/power` | 设置电源模式 |
| POST | `/tags/:content_type/:id` | 添加标签 |
| DELETE | `/tags/:content_type/:id` | 删除标签 |
| POST | `/tags/vision/batch` | 批量标签 |
| GET | `/health` | 健康检查 |
| GET | `/vision/status` | 视觉状态 |
| GET | `/vision/list` | 显示器列表 |
| GET | `/vision/metrics` | 视觉指标 |
| GET | `/audio/metrics` | 音频指标 |
| GET | `/browser/ws` | 浏览器 WebSocket |
| POST | `/browser/eval` | 浏览器执行 |
| GET | `/browser/status` | 浏览器状态 |
| GET | `/openapi.yaml` | OpenAPI YAML |
| GET | `/openapi.json` | OpenAPI JSON |

---

*本文档基于 Screenpipe v2.2+ REST API 生成*
