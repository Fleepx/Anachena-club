export default function Collapse({ open, children, className = '' }) {
  return (
    <div className={'collapse' + (open ? ' collapse-open' : '') + (className ? ' ' + className : '')}>
      <div className="collapse-inner" aria-hidden={!open}>
        {children}
      </div>
    </div>
  )
}
