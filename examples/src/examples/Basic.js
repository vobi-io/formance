import React from 'react'
import { Form, Field } from 'formance'

const submitHandler = values => {
  console.log('values', values)
}

const isWhat = value => {
  if (value === 'what') {
    return 'What?!'
  }

  return undefined
}

const emailValidator = {
  validate: (value, values) => {
    if (value === 'a@t.com') {
      return 'Not unique!'
    }
  }
}

const BasicExample = () => {
  return (
    <Form
      submitHandler={submitHandler}
    >
      {({ onSubmit, valid, submitting }) => {
				console.log('TCL: BasicExample -> valid', valid)
        
        return (
          <form onSubmit={onSubmit}>
            <Field
              name="firstName"
              placeholder="First name"
              validate={["isRequired", isWhat]}
              displayError
            />
            <br /><br />

            <Field
              name="lastName"
              placeholder="Last name"
              validate={isWhat}
              displayError
            />
            <br /><br />

            <Field
              name="email"
              placeholder="Email"
              validate={emailValidator}
              displayError
            />
            <br /><br />

            <button
              type="submit"
              disabled={!valid || submitting}
            >
              Save
            </button>
          </form>
        )
      }}
    </Form>
  )
}

export default BasicExample
