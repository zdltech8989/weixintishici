#!/bin/bash

echo "🧪 开始前端功能测试..."
echo ""

# 测试后端是否运行
echo "1️⃣ 测试后端服务..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$BACKEND_STATUS" = "200" ]; then
  echo "✅ 后端服务正常"
else
  echo "❌ 后端服务异常（状态码：$BACKEND_STATUS）"
  exit 1
fi

# 测试用户登录
echo ""
echo "2️⃣ 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangdl","password":"a123456"}')
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
else
  echo "✅ 登录成功"
  echo "Token: ${TOKEN:0:50}..."
fi

# 测试获取模板列表
echo ""
echo "3️⃣ 测试获取模板列表..."
TEMPLATES=$(curl -s -X GET http://localhost:3001/api/templates \
  -H "Authorization: Bearer $TOKEN")
TEMPLATE_COUNT=$(echo $TEMPLATES | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ "$TEMPLATE_COUNT" -gt 0 ]; then
  echo "✅ 模板列表获取成功（共$TEMPLATE_COUNT个）"
else
  echo "❌ 模板列表获取失败"
  exit 1
fi

# 测试获取标签列表
echo ""
echo "4️⃣ 测试获取标签列表..."
TAGS=$(curl -s -X GET http://localhost:3001/api/tags \
  -H "Authorization: Bearer $TOKEN")
TAG_COUNT=$(echo $TAGS | grep -o '"name":"' | wc -l)

if [ "$TAG_COUNT" -gt 0 ]; then
  echo "✅ 标签列表获取成功（共$TAG_COUNT个）"
else
  echo "❌ 标签列表获取失败"
  exit 1
fi

# 测试创建模板
echo ""
echo "5️⃣ 测试创建模板..."
NEW_TEMPLATE=$(curl -s -X POST http://localhost:3001/api/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "测试模板",
    "description": "自动化测试创建的模板",
    "content": "这是一个测试模板内容",
    "category": "测试",
    "keywords": ["测试", "自动化"],
    "tags": ["写作"]
  }')

NEW_TEMPLATE_ID=$(echo $NEW_TEMPLATE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$NEW_TEMPLATE_ID" ]; then
  echo "✅ 模板创建成功（ID: ${NEW_TEMPLATE_ID:0:20}...）"
else
  echo "❌ 模板创建失败"
  exit 1
fi

# 测试获取单个模板
echo ""
echo "6️⃣ 测试获取单个模板..."
SINGLE_TEMPLATE=$(curl -s -X GET http://localhost:3001/api/templates/$NEW_TEMPLATE_ID \
  -H "Authorization: Bearer $TOKEN")
SINGLE_TEMPLATE_TITLE=$(echo $SINGLE_TEMPLATE | grep -o '"title":"[^"]*' | cut -d'"' -f4)

if [ "$SINGLE_TEMPLATE_TITLE" = "测试模板" ]; then
  echo "✅ 单个模板获取成功"
else
  echo "❌ 单个模板获取失败"
  exit 1
fi

# 测试更新模板
echo ""
echo "7️⃣ 测试更新模板..."
UPDATE_RESULT=$(curl -s -X PUT http://localhost:3001/api/templates/$NEW_TEMPLATE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "测试模板（已更新）",
    "description": "自动化测试更新的模板",
    "content": "这是更新后的测试模板内容",
    "category": "测试",
    "keywords": ["测试", "自动化", "更新"],
    "tags": ["写作"]
  }')

UPDATE_SUCCESS=$(echo $UPDATE_RESULT | grep -o '"success":true')

if [ ! -z "$UPDATE_SUCCESS" ]; then
  echo "✅ 模板更新成功"
else
  echo "❌ 模板更新失败"
  exit 1
fi

# 测试搜索功能
echo ""
echo "8️⃣ 测试搜索功能..."
SEARCH_RESULT=$(curl -s -X GET "http://localhost:3001/api/templates?keyword=测试" \
  -H "Authorization: Bearer $TOKEN")
SEARCH_COUNT=$(echo $SEARCH_RESULT | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ "$SEARCH_COUNT" -gt 0 ]; then
  echo "✅ 搜索功能正常（找到$SEARCH_COUNT个结果）"
else
  echo "❌ 搜索功能失败"
  exit 1
fi

# 测试分类筛选
echo ""
echo "9️⃣ 测试分类筛选..."
FILTER_RESULT=$(curl -s -X GET "http://localhost:3001/api/templates?category=写作" \
  -H "Authorization: Bearer $TOKEN")
FILTER_COUNT=$(echo $FILTER_RESULT | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ "$FILTER_COUNT" -gt 0 ]; then
  echo "✅ 分类筛选正常（找到$FILTER_COUNT个结果）"
else
  echo "❌ 分类筛选失败"
  exit 1
fi

# 测试创建标签
echo ""
echo "🔟 测试创建标签..."
NEW_TAG=$(curl -s -X POST http://localhost:3001/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "测试标签",
    "color": "#FF0000"
  }')

NEW_TAG_ID=$(echo $NEW_TAG | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$NEW_TAG_ID" ]; then
  echo "✅ 标签创建成功"
else
  echo "❌ 标签创建失败"
  exit 1
fi

# 清理测试数据
echo ""
echo "🧹 清理测试数据..."
DELETE_RESULT=$(curl -s -X DELETE http://localhost:3001/api/templates/$NEW_TEMPLATE_ID \
  -H "Authorization: Bearer $TOKEN")

DELETE_SUCCESS=$(echo $DELETE_RESULT | grep -o '"success":true')

if [ ! -z "$DELETE_SUCCESS" ]; then
  echo "✅ 测试数据清理成功"
else
  echo "⚠️ 测试数据清理失败（不影响测试结果）"
fi

echo ""
echo "🎉 所有测试通过！"
echo ""
echo "📊 测试统计："
echo "   ✅ 后端服务健康检查"
echo "   ✅ 用户登录认证"
echo "   ✅ 模板列表获取"
echo "   ✅ 标签列表获取"
echo "   ✅ 模板创建"
echo "   ✅ 单个模板获取"
echo "   ✅ 模板更新"
echo "   ✅ 搜索功能"
echo "   ✅ 分类筛选"
echo "   ✅ 标签创建"
echo "   ✅ 数据清理"
echo ""
echo "🚀 系统已准备就绪，可以开始使用！"