# Formance

Enjoy forms in React :smirk:

## Installation

```
npm install --save formance
```

or

```
yarn add formance
```

## Getting Started

Formance helps to simplify managing forms in React. It's main goals are productivity and extensibility. To accomplish these goals it sets some convenient defaults and handles some repetitive jobs automatically and, also, provides clean api for constructing custom solutions.

## Basic Example

Let's take a quick look:

```jsx
import { Form, Field, FieldError } from 'formance'
import { isEmail } from './some-validators'

const isRequired = value =>
  (value ? undefined : 'Required')

const submitHandler = values => {
  console.log('values:', values)
}

const MyComponent = () => (
  <Form submitHandler={submitHandler}>
    {({ valid, onSubmit, submitting, submitted }) => (
      <form onSubmit={onSubmit}>
        <Field
          name="name"
          placeholder="Name"
          validate={isRequired}
          displayError
        />
        <FieldError name="name" />

        <Field
          name="email"
          placeholder="Email"
          validate={[isRequired, isEmail]} // validators will run in giving order, first error will be returned
          displayError // shortcut for <FieldError name="email" />
        />

        <button disabled={(submitted && !valid) || submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    )}
  </Form>
)

export default MyComponent

```

More docs and examples coming soon...