<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPage, createUser, updateUser, deleteUser as deleteUserApi } from '@/api/user'
import type { SysUser, UserQueryParams } from '@/types'
import UserFormDialog from './components/UserFormDialog.vue'

interface User extends SysUser {
  status: 'active' | 'inactive'
  role: string
}

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const currentUser = ref<User | null>(null)

const searchForm = reactive({
  username: '',
  status: ''
})

const tableData = ref<User[]>([])
const loading = ref(false)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const selectedUsers = ref<string[]>([])

const loadUsers = async () => {
  loading.value = true
  try {
    const params: UserQueryParams = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      username: searchForm.username || undefined
    }

    const result = await getUserPage(params)
    let users: User[] = result.records.map(user => ({
      ...user,
      status: 'active',
      role: '普通用户'
    }))

    if (searchForm.status) {
      users = users.filter(user => user.status === searchForm.status)
    }

    tableData.value = users
    pagination.total = result.total
  } catch {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadUsers()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  currentUser.value = null
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

const handleEdit = (id: string) => {
  const user = tableData.value.find(u => u.userId === id)
  if (user) {
    currentUser.value = user
    dialogTitle.value = '编辑用户'
    dialogVisible.value = true
  }
}

const handleFormSubmit = async (formData: any) => {
  try {
    if (currentUser.value) {
      await updateUser(currentUser.value.userId, { email: formData.email })
      ElMessage.success('更新成功')
    } else {
      await createUser({
        username: formData.username,
        password: formData.password,
        email: formData.email
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadUsers()
  } catch {
    // 错误已在请求拦截器中处理
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '确认删除', { type: 'warning' })
    await deleteUserApi(id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch {
    // 用户取消删除
  }
}

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`, '批量删除', { type: 'warning' })
    await Promise.all(selectedUsers.value.map(id => deleteUserApi(id)))
    ElMessage.success('批量删除成功')
    selectedUsers.value = []
    loadUsers()
  } catch {
    // 用户取消删除
  }
}

const handlePageChange = (page: number) => {
  pagination.currentPage = page
  loadUsers()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="users-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedUsers.length === 0">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>

        <div class="right">
          <el-button
            type="primary"
            :loading="loading"
            @click="loadUsers"
          >
            刷新
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="(selection: any) => selectedUsers = selection.map((item: any) => item.userId)"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="userName" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === '管理员' ? 'danger' : row.role === '编辑' ? 'warning' : 'info'">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row.userId)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.userId)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 用户表单弹窗 -->
    <UserFormDialog
      v-model:visible="dialogVisible"
      :user="currentUser"
      :title="dialogTitle"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.users-container {
  .search-card {
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .left {
        display: flex;
        gap: 10px;
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>