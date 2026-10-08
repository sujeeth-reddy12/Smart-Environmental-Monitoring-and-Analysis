import './Loading.css'

function Loading({ message = "Loading..." }) {
  return (
    <div className="loading" role="status" aria-label="Loading">
      <div className="loading__spinner" />
      <p className="loading__text">{message}</p>
    </div>
  )
}

export default Loading