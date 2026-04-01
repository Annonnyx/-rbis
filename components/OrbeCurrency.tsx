interface OrbeCurrencyProps {
  amount: bigint | number
  className?: string
  showDecimals?: boolean
}

export function OrbeCurrency({ amount, className = '', showDecimals = true }: OrbeCurrencyProps) {
  const centimes = typeof amount === 'number' ? BigInt(Math.round(amount)) : amount
  const orbes = centimes / 100n
  const decimal = centimes % 100n

  const formattedOrbes = orbes.toLocaleString('fr-FR')
  const formattedDecimal = decimal.toString().padStart(2, '0')

  return (
    <span className={className}>
      <span className="text-violet-400 font-medium">◎</span>{' '}
      {showDecimals ? (
        <>
          {formattedOrbes},{formattedDecimal}
        </>
      ) : (
        formattedOrbes
      )}
    </span>
  )
}
