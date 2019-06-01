import React, { useEffect, useRef } from 'react'
import useForm from './useForm'
import FormContext from './context'

const Form = ({
  initialValues,
  submitHandler,
  validate,
  validationPolicy = 'onBlur-and-onChange',
  errorDisplayPolicy = 'touched-and-submitted',
  errorClassName,
  render,
  children,
}) => {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  })

  const func = render || children
  if (!func) {
    throw new Error('You should provide render or children prop')
  }

  const formState = useForm({
    initialValues,
    submitHandler,
    validate,
    validationPolicy,
    errorDisplayPolicy,
    errorClassName,
    isMounted: isMounted.current
  })

  return (
    <FormContext.Provider value={formState}>
      {func(formState)}
    </FormContext.Provider>
  )
}

export default Form