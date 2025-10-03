import { Button } from 'react-bootstrap'

export default function NumericPad({ onPress }) {
  const buttons = ['1','2','3','del','...']
  return (
    <div className="d-flex justify-content-between mt-4">
      {buttons.map((b) => (
        <Button
          key={b}
          onClick={() => onPress(b)}
          className="flex-fill mx-2 py-5"
          style={{ borderRadius: '0.75rem' }}
          variant="primary"
        >
          {b === 'del' ? '🗑️' : b}
        </Button>
      ))}
    </div>
  )
}
