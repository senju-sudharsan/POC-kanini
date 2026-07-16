import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { MedallionExplorerPage } from '@/pages/MedallionExplorer'
import { PipelineHealthPage } from '@/pages/PipelineHealth'
import { BusinessIntelligencePage } from '@/pages/BusinessIntelligence'
import { DataQualityCenterPage } from '@/pages/DataQualityCenter'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SourceMonitoringPage } from '@/pages/SourceMonitoring'
import { AnalyticsDeepDivePage } from '@/pages/AnalyticsDeepDive'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/analytics" replace /> },
      { path: '/overview', element: <Navigate to="/analytics" replace /> },
      { path: '/medallion', element: <MedallionExplorerPage /> },
      { path: '/medallion/:layerId/:tableName', element: <MedallionExplorerPage /> },
      { path: '/pipeline', element: <PipelineHealthPage /> },
      { path: '/pipeline/batches/:batchId', element: <PipelineHealthPage /> },
      { path: '/analytics', element: <BusinessIntelligencePage /> },
      { path: '/analytics/:view', element: <AnalyticsDeepDivePage /> },
      { path: '/quality', element: <DataQualityCenterPage /> },
      { path: '/quality/:dataset', element: <DataQualityCenterPage /> },
      { path: '/sources', element: <SourceMonitoringPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
