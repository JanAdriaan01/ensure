// Add import at top
import JobFlowVisualization from '@/app/components/jobs/JobFlowVisualization';

// Add in the component, after PageHeader and before tabs
<JobFlowVisualization 
  jobId={params.id} 
  onStageChange={() => {
    fetchJobItems();
    fetchQuote();
  }} 
/>