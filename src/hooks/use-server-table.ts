import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ApiError, type Paginated } from '@/lib/api'

export interface ServerTableParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  [key: string]: unknown
}

interface UseServerTableOptions<T> {
  fetcher: (params: ServerTableParams) => Promise<Paginated<T>>
  initialSort?: string
  initialOrder?: 'asc' | 'desc'
  pageSize?: number
  initialFilters?: Record<string, unknown>
}

export function useServerTable<T>({
  fetcher,
  initialSort,
  initialOrder = 'desc',
  pageSize = 20,
  initialFilters = {},
}: UseServerTableOptions<T>) {
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [sorting, setSorting] = useState<SortingState>(
    initialSort ? [{ id: initialSort, desc: initialOrder === 'desc' }] : []
  )
  const [search, setSearchState] = useState('')
  const [filters, setFiltersState] =
    useState<Record<string, unknown>>(initialFilters)

  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const setSearch = useCallback((value: string) => {
    setSearchState(value)
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [])

  const setFilter = useCallback((key: string, value: unknown) => {
    setFiltersState((f) => {
      const next = { ...f }
      if (value === undefined || value === '' || value === null) {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [])

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  const sort = sorting[0]
  const sortId = sort?.id
  const sortDesc = sort?.desc
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        const res = await fetcherRef.current({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sort: sortId,
          order: sortId ? (sortDesc ? 'desc' : 'asc') : undefined,
          search: search || undefined,
          ...JSON.parse(filtersKey),
        })
        if (cancelled) return
        setData(res.items ?? [])
        setTotal(res.total ?? 0)
        setPageCount(res.total_pages ?? 0)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setData([])
        setError(
          err instanceof ApiError
            ? err
            : new ApiError({ code: 'error', message: 'Failed to load data.' })
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = setTimeout(run, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sortId,
    sortDesc,
    search,
    filtersKey,
    reloadKey,
  ])

  return {
    data,
    total,
    pageCount,
    loading,
    error,
    pagination,
    setPagination,
    sorting,
    setSorting,
    search,
    setSearch,
    filters,
    setFilter,
    refetch,
  }
}
