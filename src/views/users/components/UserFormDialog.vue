<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { type FormInstance } from 'element-plus'

// 用户类型定义
interface User {
  userId: string
  userName: string
  email: string
  status?: 'active' | 'inactive'
  role?: string
  createdAt: string
}

interface Props {
  visible: boolean
  user?: User | null
  title?: string
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'submit', formData: any): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  user: null,
  title: '用户表单'
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'active' as 'active' | 'inactive',
  role: 'user'
})

// 默认表单值
const defaultFormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'active' as const,
  role: 'user'
}

// 角色映射
const roleToForm = (role: string): string => {
  if (role === '管理员') return 'admin'
  if (role === '编辑') return 'editor'
  return 'user'
}

const formToRole = (role: string): string => {
  if (role === 'admin') return '管理员'
  if (role === 'editor') return '编辑'
  return '普通用户'
}

// 密码复杂度验证正则：必须包含大写字母、小写字母和数字
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

// 规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '长度在 8 到 20 个字符', trigger: 'blur' },
    {
      pattern: passwordPattern,
      message: '密码必须包含大写字母、小写字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_: any, value: string, callback: any) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 监听对话框显示
watch(() => props.visible, (visible) => {
  if (visible) {
    formRef.value?.resetFields()
    if (props.user) {
      Object.assign(form, {
        ...defaultFormValues,
        username: props.user.userName,
        email: props.user.email,
        status: props.user.status || 'active',
        role: props.user.role ? roleToForm(props.user.role) : 'user'
      })
    } else {
      Object.assign(form, defaultFormValues)
    }
  }
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const submitData: any = {
      username: form.username,
      email: form.email,
      status: form.status,
      role: formToRole(form.role)
    }

    if (props.user) {
      submitData.userId = props.user.userId
    } else {
      submitData.password = form.password
    }

    emit('submit', submitData)
  } catch {
    // 表单验证失败
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="500px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          :disabled="!!user"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          type="email"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!user">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          @keyup.enter="handleSubmit"
        />
        <div class="password-hint">
          密码要求：8-20 位，包含大写字母、小写字母和数字
        </div>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword" v-if="!user">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请确认密码"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option label="管理员" value="admin" />
          <el-option label="编辑" value="editor" />
          <el-option label="普通用户" value="user" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.password-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  line-height: 1.5;
}
</style>