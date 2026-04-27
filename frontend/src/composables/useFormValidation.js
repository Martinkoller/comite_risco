import { ref, computed } from 'vue'

export function useFormValidation() {
  const errors = ref({})

  const rules = {
    required: (value) => {
      if (!value && value !== 0) return 'Este campo é obrigatório'
      if (typeof value === 'string' && !value.trim()) return 'Este campo é obrigatório'
      return null
    },
    minLength: (min) => (value) => {
      if (!value) return null
      return value.length < min ? `Mínimo de ${min} caracteres` : null
    },
    maxLength: (max) => (value) => {
      if (!value) return null
      return value.length > max ? `Máximo de ${max} caracteres` : null
    },
    date: (value) => {
      if (!value) return null
      return isNaN(new Date(value).getTime()) ? 'Data inválida' : null
    },
    positiveInt: (value) => {
      if (!value && value !== 0) return null
      return Number.isInteger(Number(value)) && Number(value) > 0 ? null : 'Deve ser um número positivo'
    },
  }

  const validateField = (fieldName, value, fieldRules = []) => {
    errors.value[fieldName] = null
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) { errors.value[fieldName] = error; break }
    }
    return !errors.value[fieldName]
  }

  const validateForm = (form, schema) => {
    let isValid = true
    errors.value = {}
    for (const [field, fieldRules] of Object.entries(schema)) {
      if (!validateField(field, form[field], fieldRules)) isValid = false
    }
    return isValid
  }

  const clearErrors = () => { errors.value = {} }
  const hasError = (field) => !!errors.value[field]
  const getError = (field) => errors.value[field]
  const isValid = computed(() => Object.values(errors.value).every((e) => !e))

  return { errors, rules, validateField, validateForm, clearErrors, hasError, getError, isValid }
}
