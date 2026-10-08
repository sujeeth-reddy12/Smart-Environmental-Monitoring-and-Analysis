import './Error.css'

function Error({ message = 'Something went wrong.' }) {
  return (
    <div className="error" role="alert">
      <p className="error__title">Unable to load data</p>
      <p className="error__message">{message}</p>
    </div>
  )
}

export default Error
