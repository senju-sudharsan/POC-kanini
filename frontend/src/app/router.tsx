import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ExecutiveOverviewPage } from '@/pages/ExecutiveOverview'
import { MedallionExplorerPage } from '@/pages/MedallionExplorer'
import { PipelineHealthPage } from '@/pages/PipelineHealth'
import { BusinessIntelligencePage } from '@/pages/BusinessIntelligence'
import { DataQualityCenterPage } from '@/pages/DataQualityCenter'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/overview" replace /> },
      { path: '/overview', element: <ExecutiveOverviewPage /> },
      { path: '/medallion', element: <MedallionExplorerPage /> },
      { path: '/medallion/:layerId/:tableName', element: <MedallionExplorerPage /> },
      { path: '/pipeline', element: <PipelineHealthPage /> },
      { path: '/pipeline/batches/:batchId', element: <PipelineHealthPage /> },
      { path: '/analytics', element: <BusinessIntelligencePage /> },
      { path: '/quality', element: <DataQualityCenterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
