/**
 * API client para Google Analytics Data API (GA4)
 */

export interface GoogleAnalyticsProperty {
  property: string
  displayName: string
  timeZone: string
  currencyCode: string
}

export interface GoogleAnalyticsMetrics {
  activeUsers: number
  sessions: number
  bounceRate: number
  averageSessionDuration: number
  conversions: number
  eventCount: number
  screenPageViews: number
}

export interface GoogleAnalyticsDimensions {
  pagePath?: string
  source?: string
  medium?: string
  campaign?: string
  country?: string
  city?: string
}

/**
 * Busca propriedades GA4 do usuário
 */
export const getProperties = async (accessToken: string): Promise<GoogleAnalyticsProperty[]> => {
  try {
    const response = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/properties',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar propriedades do Google Analytics')
    }

    const data = await response.json()
    return data.properties || []
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    throw error
  }
}

/**
 * Busca métricas básicas de uma propriedade GA4
 */
export const getMetrics = async (
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string,
  dimensions?: string[]
): Promise<{
  metrics: GoogleAnalyticsMetrics
  dimensions?: GoogleAnalyticsDimensions[]
}> => {
  try {
    // Formatar datas (YYYY-MM-DD)
    const dateRanges = [
      {
        startDate,
        endDate,
      },
    ]

    // Métricas que queremos buscar
    const metrics = [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'conversions' },
      { name: 'eventCount' },
      { name: 'screenPageViews' },
    ]

    const requestBody: any = {
      dateRanges,
      metrics,
    }

    if (dimensions && dimensions.length > 0) {
      requestBody.dimensions = dimensions.map(name => ({ name }))
    }

    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Erro ao buscar métricas do Google Analytics')
    }

    const data = await response.json()

    // Processar resposta da API
    const rows = data.rows || []
    const firstRow = rows[0] || {}

    const metricsData: GoogleAnalyticsMetrics = {
      activeUsers: parseFloat(firstRow.metricValues?.[0]?.value || '0'),
      sessions: parseFloat(firstRow.metricValues?.[1]?.value || '0'),
      bounceRate: parseFloat(firstRow.metricValues?.[2]?.value || '0'),
      averageSessionDuration: parseFloat(firstRow.metricValues?.[3]?.value || '0'),
      conversions: parseFloat(firstRow.metricValues?.[4]?.value || '0'),
      eventCount: parseFloat(firstRow.metricValues?.[5]?.value || '0'),
      screenPageViews: parseFloat(firstRow.metricValues?.[6]?.value || '0'),
    }

    const dimensionsData = dimensions
      ? rows.map((row: any) => {
          const dim: GoogleAnalyticsDimensions = {}
          row.dimensionValues?.forEach((val: any, index: number) => {
            dim[dimensions[index] as keyof GoogleAnalyticsDimensions] = val.value
          })
          return dim
        })
      : undefined

    return {
      metrics: metricsData,
      dimensions: dimensionsData,
    }
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    throw error
  }
}

/**
 * Busca páginas mais visitadas
 */
export const getTopPages = async (
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<Array<{ pagePath: string; views: number }>> => {
  try {
    const { dimensions } = await getMetrics(
      accessToken,
      propertyId,
      startDate,
      endDate,
      ['pagePath']
    )

    if (!dimensions) return []

    return dimensions
      .filter(d => d.pagePath)
      .slice(0, limit)
      .map(d => ({
        pagePath: d.pagePath!,
        views: 0, // Seria necessário processar métricas de cada dimensão
      }))
  } catch (error) {
    console.error('Erro ao buscar páginas mais visitadas:', error)
    return []
  }
}

