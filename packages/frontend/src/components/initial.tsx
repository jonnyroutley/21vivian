import { classNames } from '@/utils/classNames'
import { Petit_Formal_Script } from 'next/font/google'

const petitFormalScript = Petit_Formal_Script({
  subsets: ['latin'],
  weight: '400',
})

type char =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

export const Initial = ({
  initial,
  className,
}: {
  initial: char
  className?: string
}) => {
  return (
    <span className={classNames(petitFormalScript.className, className)}>
      {initial}
    </span>
  )
}
