/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { POSView } from './components/POSView';
import { OverviewDashboard } from './components/OverviewDashboard';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { OrdersView } from './components/OrdersView';
import { TablesView } from './components/TablesView';
import { StaffView } from './components/StaffView';
import { CustomersView } from './components/CustomersView';
import { ExpensesView } from './components/ExpensesView';
import { SettingsView } from './components/SettingsView';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SwitchUserModal } from './components/SwitchUserModal';

function POSAppContent() {
  const { activeTab } = usePOS();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Main View */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'overview' && <OverviewDashboard />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'tables' && <TablesView />}
          {activeTab === 'menu' && <InventoryView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'staff' && <StaffView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <PaymentModal />
      <ReceiptModal />
      <SwitchUserModal />
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
}
