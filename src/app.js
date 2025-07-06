import * as duckdb from '@duckdb/duckdb-wasm';
import initSQL from './init.sql?raw';

class SQLPlayground {
    constructor() {
        this.db = null;
        this.conn = null;
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.initializeDuckDB();
            await this.loadInitialData();
            this.setupEventListeners();
            this.showStatus('Ready! Try running some SQL queries.', 'success');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showStatus('Failed to initialize database. Please refresh the page.', 'error');
        }
    }

    async initializeDuckDB() {
        // Initialize DuckDB
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
        const worker = await duckdb.createWorker(bundle.mainWorker);
        const logger = new duckdb.VoidLogger();
        this.db = new duckdb.AsyncDuckDB(logger, worker);
        await this.db.instantiate(bundle.mainModule);
        this.conn = await this.db.connect();
    }

    async loadInitialData() {
        // Load the initial SQL schema and data
        const statements = this.splitSQLStatements(initSQL);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await this.conn.query(statement);
            }
        }
    }

    splitSQLStatements(sql) {
        // Simple SQL statement splitter (handles basic cases)
        return sql.split(';').map(stmt => stmt.trim()).filter(stmt => stmt);
    }

    setupEventListeners() {
        const executeBtn = document.getElementById('execute-btn');
        const clearBtn = document.getElementById('clear-btn');
        const sqlInput = document.getElementById('sql-input');
        const sampleQueries = document.querySelectorAll('.sample-query');

        executeBtn?.addEventListener('click', () => this.executeQuery());
        clearBtn?.addEventListener('click', () => this.clearResults());
        
        // Execute on Ctrl+Enter
        sqlInput?.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.executeQuery();
            }
        });

        // Sample query buttons
        sampleQueries.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                if (query && sqlInput) {
                    sqlInput.value = query;
                }
            });
        });
    }

    async executeQuery() {
        const sqlInput = document.getElementById('sql-input');
        const query = sqlInput?.value.trim();
        
        if (!query) {
            this.showStatus('Please enter a SQL query.', 'warning');
            return;
        }

        try {
            this.showStatus('Executing query...', 'info');
            const startTime = performance.now();
            
            const result = await this.conn.query(query);
            const endTime = performance.now();
            const executionTime = Math.round((endTime - startTime) * 100) / 100;
            
            this.displayResults(result, executionTime);
            this.showStatus(`Query executed successfully in ${executionTime}ms`, 'success');
            
        } catch (error) {
            console.error('Query execution error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
            this.clearResults();
        }
    }

    displayResults(result, executionTime) {
        const resultsContainer = document.getElementById('results-container');
        const resultsTable = document.getElementById('results-table');
        const executionTimeEl = document.getElementById('execution-time');
        
        if (!resultsContainer || !resultsTable) return;

        resultsContainer.style.display = 'block';
        
        // Display execution time
        if (executionTimeEl) {
            executionTimeEl.textContent = `Execution time: ${executionTime}ms`;
        }

        // Clear previous results
        resultsTable.innerHTML = '';

        if (result.numRows === 0) {
            resultsTable.innerHTML = '<tr><td colspan="100%">No results found</td></tr>';
            return;
        }

        // Create table header
        const headers = result.schema.fields.map(field => field.name);
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        resultsTable.appendChild(headerRow);

        // Create table rows
        const rows = result.toArray();
        rows.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value !== null ? value.toString() : 'NULL';
                tr.appendChild(td);
            });
            resultsTable.appendChild(tr);
        });
    }

    clearResults() {
        const resultsContainer = document.getElementById('results-container');
        const resultsTable = document.getElementById('results-table');
        const executionTimeEl = document.getElementById('execution-time');
        
        if (resultsContainer) resultsContainer.style.display = 'none';
        if (resultsTable) resultsTable.innerHTML = '';
        if (executionTimeEl) executionTimeEl.textContent = '';
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        
        // Auto-hide success/info messages after 3 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (statusEl.textContent === message) {
                    statusEl.textContent = '';
                    statusEl.className = 'status';
                }
            }, 3000);
        }
    }

    // Sample queries for quick testing
    getSampleQueries() {
        return [
            {
                name: "All Employees",
                query: "SELECT * FROM employees ORDER BY name;"
            },
            {
                name: "High Earners",
                query: "SELECT name, salary FROM employees WHERE salary > 80000 ORDER BY salary DESC;"
            },
            {
                name: "Department Summary",
                query: "SELECT d.name, COUNT(e.id) as employee_count, AVG(e.salary) as avg_salary FROM departments d LEFT JOIN employees e ON d.name = e.department GROUP BY d.name;"
            },
            {
                name: "Employees with Managers",
                query: "SELECT e.name as employee, m.name as manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;"
            }
        ];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SQLPlayground();
});

// Export for potential use in other modules
export default SQLPlayground;