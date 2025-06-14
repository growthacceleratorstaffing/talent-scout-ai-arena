
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { linkedInService, LinkedInAdAccount, LinkedInCampaign, LinkedInLead } from '@/services/linkedinService';
import { Loader2, RefreshCw, Users, Target, TrendingUp } from 'lucide-react';

const LinkedInDashboard = () => {
  const [adAccounts, setAdAccounts] = useState<LinkedInAdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<LinkedInCampaign[]>([]);
  const [leads, setLeads] = useState<LinkedInLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsData, campaignsData, leadsData] = await Promise.all([
        linkedInService.getAdAccounts(),
        linkedInService.getCampaigns(),
        linkedInService.getLeads()
      ]);

      setAdAccounts(accountsData);
      setCampaigns(campaignsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading LinkedIn data:', error);
      toast({
        title: "Error",
        description: "Failed to load LinkedIn data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: string) => {
    setSyncing(type);
    try {
      let result;
      switch (type) {
        case 'accounts':
          result = await linkedInService.syncAdAccounts();
          break;
        case 'campaigns':
          result = await linkedInService.syncCampaigns();
          break;
        case 'leads':
          result = await linkedInService.syncLeads();
          break;
      }

      toast({
        title: "Sync Complete",
        description: `Synced ${result.count || 0} ${type}`,
      });

      await loadData();
    } catch (error) {
      console.error(`Error syncing ${type}:`, error);
      toast({
        title: "Sync Error",
        description: `Failed to sync ${type}`,
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">LinkedIn Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleSync('accounts')}
            disabled={syncing === 'accounts'}
            variant="outline"
          >
            {syncing === 'accounts' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Accounts
          </Button>
          <Button
            onClick={() => handleSync('campaigns')}
            disabled={syncing === 'campaigns'}
            variant="outline"
          >
            {syncing === 'campaigns' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            Sync Campaigns
          </Button>
          <Button
            onClick={() => handleSync('leads')}
            disabled={syncing === 'leads'}
            variant="outline"
          >
            {syncing === 'leads' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            Sync Leads
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Accounts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active LinkedIn ad accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              Total leads generated
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="accounts">Ad Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Campaigns</CardTitle>
              <CardDescription>
                Manage your LinkedIn advertising campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Last Synced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.campaign_type}</TableCell>
                      <TableCell>
                        {formatCurrency(campaign.budget_amount, campaign.budget_currency)}
                      </TableCell>
                      <TableCell>{campaign.impressions?.toLocaleString() || 0}</TableCell>
                      <TableCell>{campaign.clicks?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        {formatCurrency(campaign.spend, campaign.budget_currency)}
                      </TableCell>
                      <TableCell>{formatDate(campaign.last_synced_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Leads</CardTitle>
              <CardDescription>
                View and manage leads from your LinkedIn campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {`${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'N/A'}
                      </TableCell>
                      <TableCell>{lead.email || 'N/A'}</TableCell>
                      <TableCell>{lead.company || 'N/A'}</TableCell>
                      <TableCell>{lead.job_title || 'N/A'}</TableCell>
                      <TableCell>{lead.phone || 'N/A'}</TableCell>
                      <TableCell>{lead.form_name || 'N/A'}</TableCell>
                      <TableCell>{formatDate(lead.submitted_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Ad Accounts</CardTitle>
              <CardDescription>
                Your connected LinkedIn advertising accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>LinkedIn ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'ENABLED' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.currency}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.linkedin_account_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkedInDashboard;
