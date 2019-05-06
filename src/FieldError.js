import React, { useContext } from 'react'
import FormContext from './context'

const FieldError = ({
  name,
  component,
  render,
  children,
}) => {
  const form = useContext(FormContext)

  const submitted = form.submitted
  const touched = form.touched[name]
  const error = form.errors[name]
  const errorDisplayPolicy = form.fields[name] && form.fields[name].errorDisplayPolicy 
    ? form.fields[name].errorDisplayPolicy
    : 'touched'

  const hasError = (Array.isArray(error) && error.length > 0) || error

  if (!hasError || !touched) {
    return null
  }

  if (['touched', 'touched-and-submitted'].includes(errorDisplayPolicy) && !touched) {
    return null
  }

  if (errorDisplayPolicy === 'touched-and-submitted' && !submitted) {
    return null
  }

  const firstError = Array.isArray(error)
    ? error[0]
    : error

  if (render) {
    if (typeof render !== 'function') {
      throw new TypeError('`render` prop should be a function')
    }

    return render(firstError)
  }

  if (children) {
    if (typeof children !== 'function') {
      throw new TypeError('`render` prop should be a function')
    }

    return children(firstError)
  }

  if (component) {
    return React.createElement(component, null, firstError)
  }

  return firstError
}

export default FieldError
