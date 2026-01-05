'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react'

interface CSVUploadProps {
  onUploadComplete?: () => void
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Alleen CSV bestanden zijn toegestaan')
      return
    }

    setFile(selectedFile)
    setError('')
    setSuccess('')

    const text = await selectedFile.text()
    const rows = text.split('\n').filter(row => row.trim())
    
    if (rows.length < 2) {
      setError('CSV moet minimaal 1 order bevatten')
      return
    }

    const headers = rows[0].split(',').map(h => h.trim())
    const previewData = rows.slice(1, 6).map(row => {
      const values = row.split(',').map(v => v.trim())
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]
        return obj
      }, {} as any)
    })

    setPreview(previewData)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError('')

      const text = await file.text()
      const rows = text.split('\n').filter(row => row.trim())
      const headers = rows[0].split(',').map(h => h.trim())
      
      const orders = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim())
        const order = headers.reduce((obj, header, index) => {
          obj[header] = values[index]
          return obj
        }, {} as any)

        return {
          customer_name: order.customer_name || order.klant || order.Customer,
          address: order.address || order.adres || order.Address,
          weight_kg: parseFloat(order.weight_kg || order.gewicht || order.Weight || '0'),
          priority: parseInt(order.priority || order.prioriteit || order.Priority || '1'),
          notes: order.notes || order.opmerkingen || order.Notes || ''
        }
      }).filter(order => order.customer_name && order.address)

      if (orders.length === 0) {
        setError('Geen geldige orders gevonden in CSV')
        return
      }

      const token = localStorage.getItem('routegenius_token')
      if (!token) {
        setError('Niet ingelogd')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orders)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload mislukt')
      }

      const result = await response.json()
      setSuccess(`✅ ${result.created || orders.length} orders succesvol geïmporteerd!`)
      setFile(null)
      setPreview([])
      
      if (onUploadComplete) {
        setTimeout(() => onUploadComplete(), 1500)
      }

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload mislukt')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📤 CSV Upload
        </h3>
        <p className="text-sm text-gray-600">
          Upload een CSV met orders. Minimale kolommen: customer_name, address, weight_kg
        </p>
      </div>

      <div className="mb-4">
        <label className="block w-full">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">
                  Klik om CSV te selecteren
                </p>
                <p className="text-sm text-gray-500">
                  Of sleep hier naartoe
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {preview.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Preview (eerste 5 orders):
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map(key => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="px-4 py-2 whitespace-nowrap text-gray-900">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="flex gap-3">
        {file && (
          <button
            onClick={() => {
              setFile(null)
              setPreview([])
              setError('')
              setSuccess('')
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={uploading}
          >
            Annuleren
          </button>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="animate-spin">⚡</span>
              Uploaden...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload {preview.length > 0 && `(${preview.length}+ orders)`}
            </>
          )}
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          📄 CSV Formaat:
        </h4>
        <code className="text-xs text-gray-700 block">
          customer_name,address,weight_kg,priority,notes<br />
          ABC Transport,Amsterdam Centraal,50,1,Fragiel pakket<br />
          XYZ Logistics,Rotterdam Haven,75,2,Spoed levering
        </code>
      </div>
    </div>
  )
}
