<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UserFormDialog from './components/UserFormDialog.vue'
import { getUserById, createUser, updateUser } from '@/api/user'
import type { SysUser } from '@/types'

interface UserWithRole extends SysUser {
  status?: 'active' | 'inactive'
  role?: string
}

const route = useRoute()
const router = useRouter()

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const currentUser = ref<UserWithRole | null>(null)
const loading = ref(false)

onMounted(async () => {
  const userId = route.query.id as string | undefined

  if (userId) {
    dialogTitle.value = '编辑用户'
    loading.value = true
    try {
      const user = await getUserById(userId)
      currentUser.value = { ...user, status: 'active', role: '普通用户' }
    } catch {
      ElMessage.error('用户不存在')
      router.push('/users')
    } finally {
      loading.value = false
    }
  } else {
    dialogTitle.value = '新增用户'
  }

  dialogVisible.value = true
})

const handleFormSubmit = async (formData: any) => {
  try {
    loading.value = true
    if (currentUser.value) {
      await updateUser(currentUser.value.userId, formData)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(formData)
      ElMessage.success('用户添加成功')
    }

    dialogVisible.value = false
    setTimeout(() => router.push('/users'), 500)
  } catch {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="edit-user-page">
    <UserFormDialog
      v-model:visible="dialogVisible"
      :user="currentUser"
      :title="dialogTitle"
      @submit="handleFormSubmit"
    />
  </div>
</template>