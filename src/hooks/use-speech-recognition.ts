import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionResultLike {
  transcript: string
  confidence: number
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<{ 0: SpeechRecognitionResultLike; isFinal: boolean }>
  resultIndex: number
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike }
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike }
  }
}

export function useSpeechRecognition(onTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalTextRef = useRef('')
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined

    if (!SpeechRecognitionCtor) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = ''
      let finalChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalChunk += text
        } else {
          interim += text
        }
      }

      if (finalChunk) {
        finalTextRef.current = (finalTextRef.current + ' ' + finalChunk).trim()
      }
      setInterimText(interim)

      const fullText = (finalTextRef.current + (interim ? ' ' + interim : '')).trim()
      onTranscriptRef.current?.(fullText)
    }

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Permissão de microfone negada. Habilite o acesso nas configurações do navegador.')
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Erro no reconhecimento: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
      if (finalTextRef.current && onTranscriptRef.current) {
        onTranscriptRef.current(finalTextRef.current)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.onstart = null
      try {
        recognition.abort()
      } catch {
        // noop
      }
    }
  }, [])

  const start = useCallback(
    (currentText: string = '') => {
      if (!recognitionRef.current || isListening) return
      finalTextRef.current = currentText
      setInterimText('')
      setError(null)
      try {
        recognitionRef.current.start()
      } catch {
        // noop — recognition may already be started
      }
    },
    [isListening],
  )

  const stop = useCallback(() => {
    if (!recognitionRef.current || !isListening) return
    try {
      recognitionRef.current.stop()
    } catch {
      // noop
    }
    setIsListening(false)
  }, [isListening])

  const toggle = useCallback(
    (currentText: string = '') => {
      if (isListening) {
        stop()
      } else {
        start(currentText)
      }
    },
    [isListening, start, stop],
  )

  const reset = useCallback(() => {
    finalTextRef.current = ''
    setInterimText('')
    setError(null)
  }, [])

  return {
    isListening,
    interimText,
    error,
    isSupported,
    start,
    stop,
    toggle,
    reset,
  }
}
