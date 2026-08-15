import { useMemo } from 'react'
import { normalizeApiError } from '../api/errors'
import { pushToast, type ToastTone } from '../store/uiSlice'
import { useAppDispatch } from '../store/hooks'

export function useToast() {
  const dispatch = useAppDispatch()

  return useMemo(
    () => ({
      error: (cause: unknown) =>
        dispatch(
          pushToast(
            typeof cause === 'string' ? cause : normalizeApiError(cause).message,
            'error',
          ),
        ),
      info: (message: string) => dispatch(pushToast(message, 'info')),
      show: (message: string, tone: ToastTone = 'success') => dispatch(pushToast(message, tone)),
      success: (message: string) => dispatch(pushToast(message, 'success')),
    }),
    [dispatch],
  )
}
