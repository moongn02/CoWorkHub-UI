<template>
  <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-menu">
    <div class="menu-wrapper">
      <!-- Logo和标题区域 -->
      <div class="logo-container">
        <img
            src="@/assets/logo.svg"
            :class="{'logo': true, 'logo-collapse': isCollapse }"
            alt="CoWorkHub"
        />
        <h1 class="logo-text" v-show="!isCollapse">CoWorkHub</h1>
      </div>

      <!-- 滚动菜单区域 -->
      <div class="menu-scroll-container">
        <el-menu
            :default-active="activeMenu"
            :default-openeds="defaultOpeneds"
            class="el-menu-vertical"
            :collapse="isCollapse"
            router
            @open="handleOpen"
            @close="handleClose"
            background-color="#2d2d2d"
            text-color="#bfcbd9"
            active-text-color="#409EFF"
        >
          <template v-for="menu in filteredMenuList" :key="menu.path">
            <!-- 没有子菜单的菜单项 -->
            <el-menu-item
                v-if="!menu.children || menu.children.length === 0"
                :index="menu.path"
                @click="menu.path === '/logout' && handleLogout()"
            >
              <el-icon>
                <component :is="iconMap[menu.icon]" />
              </el-icon>
              <template #title>{{ menu.title }}</template>
            </el-menu-item>

            <!-- 有子菜单的菜单项 -->
            <el-sub-menu v-else :index="menu.path">
              <template #title>
                <el-icon>
                  <component :is="iconMap[menu.icon]" />
                </el-icon>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item
                  v-for="child in menu.children"
                  :key="child.path"
                  :index="child.path"
              >
                {{ child.title }}
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </div>
    </div>

    <!-- 折叠按钮 -->
    <div :class="{'collapse-container': true, 'collapse-container-collapsed': isCollapse }">
      <el-icon class="collapse-btn" @click="toggleCollapse">
        <Fold v-if="!isCollapse" />
        <Expand v-else />
      </el-icon>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash'
import { menuList, iconMap } from '@/config/menu'
import { Fold, Expand } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = ref(route.path)
const defaultOpeneds = ref<string[]>([])

// 根据权限过滤菜单
const filteredMenuList = computed(() => {
  // 使用深拷贝避免修改原始菜单数据
  const clonedMenus = cloneDeep(menuList)
  return filterMenuByPermission(clonedMenus)
})

// 过滤菜单的函数
function filterMenuByPermission(menus) {
  if (!menus || !Array.isArray(menus)) return []

  return menus.filter(menu => {
    // 检查是否有父级菜单权限
    if (userStore.hasPermission(menu.permission)) {
      // 有父级权限，但需要过滤子菜单
      if (menu.children && menu.children.length) {
        // 只保留有权限的子菜单
        menu.children = menu.children.filter(child =>
            !child.permission || userStore.hasPermission(child.permission)
        )
      }
      return true
    } else {
      // 没有父级权限，检查是否有任何子菜单的权限
      if (menu.children && menu.children.length) {
        // 过滤子菜单，只保留有权限的子菜单
        menu.children = menu.children.filter(child =>
            !child.permission || userStore.hasPermission(child.permission)
        )
        // 如果过滤后有子菜单，显示父菜单
        return menu.children.length > 0
      }
      // 没有子菜单且没有父级权限，不显示
      return false
    }
  })
}

onMounted(() => {
  const savedOpeneds = localStorage.getItem('menu_openeds')
  if (savedOpeneds) {
    defaultOpeneds.value = JSON.parse(savedOpeneds)
  }

  const savedCollapse = localStorage.getItem('menu_collapse')
  if (savedCollapse) {
    isCollapse.value = JSON.parse(savedCollapse)
  }
})

watch(
    () => route.path,
    (newPath) => {
      activeMenu.value = newPath
    }
)

const handleOpen = (index: string) => {
  if (!defaultOpeneds.value.includes(index)) {
    defaultOpeneds.value.push(index)
    saveOpenedState()
  }
}

const handleClose = (index: string) => {
  const idx = defaultOpeneds.value.indexOf(index)
  if (idx > -1) {
    defaultOpeneds.value.splice(idx, 1)
    saveOpenedState()
  }
}

const saveOpenedState = () => {
  localStorage.setItem('menu_openeds', JSON.stringify(defaultOpeneds.value))
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('menu_collapse', JSON.stringify(isCollapse.value))

  if (isCollapse.value) {
    defaultOpeneds.value = []
    saveOpenedState()
  }
}

const handleLogout = async () => {
  try {
    await userStore.logoutAction()
  } catch (error) {
    console.error('退出失败:', error)
    ElMessage.error('退出失败，请重试')
  }
}
</script>

<style scoped>
.aside-menu {
  height: 100vh;
  background-color: #2d2d2d;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 200px;
}

.menu-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 60px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.logo {
  height: 32px;
  margin-right: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-collapse {
  margin-right: 0;
}

.logo-text {
  margin: 0 0 0 12px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  white-space: nowrap;
}

.menu-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0;
  margin-right: 0;
}

.menu-scroll-container::-webkit-scrollbar {
  width: 2.5px;
}

.menu-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.menu-scroll-container::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 1.25px;
}

.menu-scroll-container:hover::-webkit-scrollbar-thumb {
  background-color: #409EFF;
}

.el-menu-vertical {
  border-right: none;
  height: auto !important;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

/* 弹出子菜单样式 */
:deep(.el-menu--popup) {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  background-color: #2d2d2d !important;
}

:deep(.el-menu--popup::-webkit-scrollbar) {
  width: 2.5px;
}

:deep(.el-menu--popup::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.el-menu--popup::-webkit-scrollbar-thumb) {
  background-color: #909399;
  border-radius: 1.25px;
}

:deep(.el-menu--popup:hover::-webkit-scrollbar-thumb) {
  background-color: #409EFF;
}

:deep(.el-menu--popup .el-menu-item) {
  background-color: #2d2d2d;
  color: #bfcbd9;
  min-width: 180px;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background-color: #409EFF;
  color: #ffffff;
}

:deep(.el-menu--popup .el-menu-item.is-active) {
  background-color: #409EFF;
  color: #ffffff;
}

:deep(.el-sub-menu .el-menu) {
  background-color: #2d2d2d;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 200px;
  background-color: #2d2d2d;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-menu-item span),
:deep(.el-sub-menu__title span) {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.el-menu--collapse :deep(.el-menu-item span),
.el-menu--collapse :deep(.el-sub-menu__title span) {
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-menu--collapse .el-sub-menu) {
  position: relative;
}

:deep(.el-menu--collapse .el-sub-menu > .el-menu--popup) {
  left: 64px !important;
}

.collapse-container {
  position: absolute;
  bottom: 20px;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #2d2d2d;
  z-index: 1;
}

.collapse-container-collapsed {
  justify-content: center;
  padding-right: 0;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4a4a4a;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #bfbfbf;
  font-size: 20px;
}

.collapse-btn:hover {
  background-color: #5a5a5a;
  color: #409EFF;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 16px;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-menu--collapse .el-menu-item .el-icon),
:deep(.el-menu--collapse .el-sub-menu__title .el-icon) {
  margin-right: 0;
}

:deep(.el-aside) {
  background-color: #2d2d2d;
  width: auto !important;
  flex-shrink: 0;
  transition: width 0.3s;
}
</style>
