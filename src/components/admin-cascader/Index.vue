<!--
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2022-11-25 00:31:51
 * @LastEditTime: 2023-05-31 22:26:06
 * @LastEditors: cweibo legend2weibo@gmail.com
 * @Description:
 * @FilePath: \lc_-sys_-platform\src\components\admin-cascader\Index.vue
-->
<template>
  <el-cascader
    ref="adminCascaderRef"
    :key="modelKey"
    v-model="value"
    :props="cascaderProps"
    validate-event
    :size="size"
    clearable
  />
</template>
<script lang="ts" setup>
import * as api from '@src/api'
import { computed, onMounted, ref } from 'vue'

// defineOptions({
//   name: 'AdminCascader'
// })

const props = defineProps({
  modelValue: String,
  size: String,
  displayId: {
    type: Boolean,
    default: false
  }
})

const adminCascaderRef = ref(null)
const modelKey = ref(0)
const emits = defineEmits(['update:modelValue', 'inputValueChanged'])
const value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
    emits('inputValueChanged', adminCascaderRef.value.inputValue)
    props.displayId && (adminCascaderRef.value.inputValue = val)
  }
})

const cascaderProps = {
  value: 'extId',
  label: 'name',
  lazy: true,
  emitPath: false,
  checkStrictly: true,
  lazyLoad(node, resolve) {
    const { level, data } = node
    if (level === 0) {
      // api.dict.getAdcodeById().then(res => {
      //   resolve(res.data)
      // })
    } else {
      // api.dict.getAdcodeById(data.id).then(res => {
      //   res.data.forEach(v => {
      //     v.leaf = level > 1
      //   })
      //   resolve(res.data)
      // })
    }
  }
}

onMounted(() => {
  modelKey.value++
  if (props.modelValue && props.displayId) {
    adminCascaderRef.value.inputValue = props.modelValue
  }
})
</script>
