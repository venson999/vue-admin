<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)

interface StatItem {
  title: string
  value: number
  icon: string
  color: string
}

const stats = ref<StatItem[]>([
  { title: '用户总数', value: 0, icon: 'User', color: '#409eff' },
  { title: '今日访问', value: 0, icon: 'View', color: '#67c23a' },
  { title: '系统消息', value: 0, icon: 'Bell', color: '#e6a23c' },
  { title: '待办事项', value: 0, icon: 'List', color: '#f56c6c' }
])

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = async () => {
  loading.value = true
  try {
    stats.value[0].value = 1234
    stats.value[1].value = 567
    stats.value[2].value = 89
    stats.value[3].value = 12
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6" v-for="item in stats" :key="item.title">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-content">
            <div class="stats-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="24">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ item.value }}</div>
              <div class="stats-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 欢迎卡片 -->
    <el-row :gutter="20" class="welcome-row">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h2>欢迎使用 Vue Admin System</h2>
            <p>这是一个基于 Vue 3 + TypeScript + Element Plus 构建的后台管理系统</p>
            <div class="feature-list">
              <el-tag type="success">Vue 3</el-tag>
              <el-tag type="primary">TypeScript</el-tag>
              <el-tag type="warning">Vite</el-tag>
              <el-tag type="info">Pinia</el-tag>
              <el-tag type="danger">Element Plus</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-row :gutter="20" class="quick-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <el-card class="quick-card" shadow="hover">
          <div class="quick-content">
            <el-icon :size="40" color="#409eff"><User /></el-icon>
            <h3>用户管理</h3>
            <p>管理系统用户信息</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  .stats-row {
    margin-bottom: 20px;
  }

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .stats-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .stats-info {
        flex: 1;

        .stats-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .stats-title {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .welcome-row {
    margin-bottom: 20px;
  }

  .welcome-card {
    .welcome-content {
      h2 {
        font-size: 24px;
        color: #303133;
        margin-bottom: 15px;
      }

      p {
        font-size: 14px;
        color: #606266;
        margin-bottom: 20px;
      }

      .feature-list {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    }
  }

  .quick-row {
    .quick-card {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      .quick-content {
        text-align: center;
        padding: 20px 0;

        h3 {
          font-size: 18px;
          color: #303133;
          margin: 15px 0 10px;
        }

        p {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}
</style>
