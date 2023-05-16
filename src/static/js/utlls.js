export const $ = selector => document.querySelector(selector)

export const removeChildren = parent => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

// друкарський алгоритм (алгоритм Рабіна-Карпа)
export const rabinKarp = (text, pattern, percentage = 0.8) => {
    const patternLength = pattern.length
    const thresholdLength = patternLength * percentage

    for (let i = 0; i <= text.length - patternLength; i++) {
        const substring = text.substring(i, i + patternLength)
        let matchCount = 0

        for (let j = 0; j < patternLength; j++) {
            if (substring[j] === pattern[j]) {
                matchCount++
            }
        }

        if (matchCount >= thresholdLength) {
            return true
        }
    }

    return false
}

export const FETCH = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    }).catch(error => {
        console.error(error)
        return { status: 500 }
    })
    return await response.json()
}

export const fetchService = async serviceName => await FETCH(`/api/${serviceName}`)

export const formatDate = date => {
    return new Date(date).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    })
}
