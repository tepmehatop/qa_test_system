import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/qa.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL for better performance
db.pragma('journal_mode = WAL');

export function initDb(): void {
  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `);

  // W3Schools-style tables for Task 3
  db.exec(`
    CREATE TABLE IF NOT EXISTS Customers (
      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerName TEXT NOT NULL,
      ContactName TEXT,
      Address TEXT,
      City TEXT,
      PostalCode TEXT,
      Country TEXT
    );

    CREATE TABLE IF NOT EXISTS Categories (
      CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
      CategoryName TEXT NOT NULL,
      Description TEXT
    );

    CREATE TABLE IF NOT EXISTS Suppliers (
      SupplierID INTEGER PRIMARY KEY AUTOINCREMENT,
      SupplierName TEXT NOT NULL,
      ContactName TEXT,
      Address TEXT,
      City TEXT,
      PostalCode TEXT,
      Country TEXT,
      Phone TEXT
    );

    CREATE TABLE IF NOT EXISTS Products (
      ProductID INTEGER PRIMARY KEY AUTOINCREMENT,
      ProductName TEXT NOT NULL,
      SupplierID INTEGER,
      CategoryID INTEGER,
      Unit TEXT,
      Price REAL,
      FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
      FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
    );

    CREATE TABLE IF NOT EXISTS Shippers (
      ShipperID INTEGER PRIMARY KEY AUTOINCREMENT,
      ShipperName TEXT NOT NULL,
      Phone TEXT
    );

    CREATE TABLE IF NOT EXISTS Orders (
      OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerID INTEGER,
      EmployeeID INTEGER,
      OrderDate TEXT,
      ShipperID INTEGER,
      FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
      FOREIGN KEY (ShipperID) REFERENCES Shippers(ShipperID)
    );

    CREATE TABLE IF NOT EXISTS OrderDetails (
      OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderID INTEGER,
      ProductID INTEGER,
      Quantity INTEGER,
      FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
      FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
    );
  `);

  seedDb();
}

function seedDb(): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM Customers').get() as { c: number }).c;
  if (count > 0) return; // already seeded

  // Categories
  const catStmt = db.prepare('INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)');
  const cats = [
    ['Beverages', 'Soft drinks, coffees, teas, beers, and ales'],
    ['Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings'],
    ['Confections', 'Desserts, candies, and sweet breads'],
    ['Dairy Products', 'Cheeses'],
    ['Grains/Cereals', 'Breads, crackers, pasta, and cereal'],
    ['Meat/Poultry', 'Prepared meats'],
    ['Produce', 'Dried fruit and bean curd'],
    ['Seafood', 'Seaweed and fish'],
  ];
  cats.forEach(([name, desc]) => catStmt.run(name, desc));

  // Suppliers
  const supStmt = db.prepare('INSERT INTO Suppliers (SupplierName, ContactName, Address, City, PostalCode, Country, Phone) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const suppliers = [
    ['Exotic Liquid', 'Charlotte Cooper', '49 Gilbert St.', 'London', 'EC1 4SD', 'UK', '(171) 555-2222'],
    ['New Orleans Cajun Delights', 'Shelley Burke', 'P.O. Box 78934', 'New Orleans', '70117', 'USA', '(100) 555-4822'],
    ['Grandma Kelly\'s Homestead', 'Regina Murphy', '707 Oxford Rd.', 'Ann Arbor', '48104', 'USA', '(313) 555-5735'],
    ['Tokyo Traders', 'Yoshi Nagase', '9-8 Sekimai Musashino-shi', 'Tokyo', '100', 'Japan', '(03) 3555-5011'],
    ['Cooperativa de Quesos Las Cabras', 'Antonio del Valle Saavedra', 'Calle del Rosal 4', 'Oviedo', '33007', 'Spain', '(98) 598 76 54'],
  ];
  suppliers.forEach((s) => supStmt.run(...s));

  // Products
  const prodStmt = db.prepare('INSERT INTO Products (ProductName, SupplierID, CategoryID, Unit, Price) VALUES (?, ?, ?, ?, ?)');
  const products = [
    ['Chai', 1, 1, '10 boxes x 20 bags', 18.00],
    ['Chang', 1, 1, '24 - 12 oz bottles', 19.00],
    ['Aniseed Syrup', 1, 2, '12 - 550 ml bottles', 10.00],
    ['Chef Anton\'s Cajun Seasoning', 2, 2, '48 - 6 oz jars', 22.00],
    ['Chef Anton\'s Gumbo Mix', 2, 2, '36 boxes', 21.35],
    ['Grandma\'s Boysenberry Spread', 3, 2, '12 - 8 oz jars', 25.00],
    ['Uncle Bob\'s Organic Dried Pears', 3, 7, '12 - 1 lb pkgs.', 30.00],
    ['Northwoods Cranberry Sauce', 3, 2, '12 - 12 oz jars', 40.00],
    ['Mishi Kobe Niku', 4, 6, '18 - 500 g pkgs.', 97.00],
    ['Ikura', 4, 8, '12 - 200 ml jars', 31.00],
    ['Queso Cabrales', 5, 4, '1 kg pkg.', 21.00],
    ['Queso Manchego La Pastora', 5, 4, '10 - 500 g pkgs.', 38.00],
    ['Konbu', 4, 8, '2 kg box', 6.00],
    ['Tofu', 4, 7, '40 - 100 g pkgs.', 23.25],
    ['Genen Shouyu', 4, 2, '24 - 250 ml bottles', 15.50],
  ];
  products.forEach((p) => prodStmt.run(...p));

  // Shippers
  const shipStmt = db.prepare('INSERT INTO Shippers (ShipperName, Phone) VALUES (?, ?)');
  [
    ['Speedy Express', '(503) 555-9831'],
    ['United Package', '(503) 555-3199'],
    ['Federal Shipping', '(503) 555-9931'],
  ].forEach((s) => shipStmt.run(...s));

  // Customers
  const custStmt = db.prepare('INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (?, ?, ?, ?, ?, ?)');
  const customers = [
    ['Alfreds Futterkiste', 'Maria Anders', 'Obere Str. 57', 'Berlin', '12209', 'Germany'],
    ['Ana Trujillo Emparedados y helados', 'Ana Trujillo', 'Avda. de la Constitución 2222', 'México D.F.', '05021', 'Mexico'],
    ['Antonio Moreno Taquería', 'Antonio Moreno', 'Mataderos 2312', 'México D.F.', '05023', 'Mexico'],
    ['Around the Horn', 'Thomas Hardy', '120 Hanover Sq.', 'London', 'WA1 1DP', 'UK'],
    ['Berglunds snabbköp', 'Christina Berglund', 'Berguvsvägen 8', 'Luleå', 'S-958 22', 'Sweden'],
    ['Blauer See Delikatessen', 'Hanna Moos', 'Forsterstr. 57', 'Mannheim', '68306', 'Germany'],
    ['Blondel père et fils', 'Frédérique Citeaux', '24, place Kléber', 'Strasbourg', '67000', 'France'],
    ['Bólido Comidas preparadas', 'Martín Sommer', 'C/ Araquil, 67', 'Madrid', '28023', 'Spain'],
    ['Bon app\'', 'Laurence Lebihan', '12, rue des Bouchers', 'Marseille', '13008', 'France'],
    ['Bottom-Dollar Marketse', 'Elizabeth Lincoln', '23 Tsawassen Blvd.', 'Tsawassen', 'T2F 8M4', 'Canada'],
    ['B\'s Beverages', 'Victoria Ashworth', 'Fauntleroy Circus', 'London', 'EC2 5NT', 'UK'],
    ['Cactus Comidas para llevar', 'Patricio Simpson', 'Cerrito 333', 'Buenos Aires', '1010', 'Argentina'],
    ['Centro comercial Moctezuma', 'Francisco Chang', 'Sierras de Granada 9993', 'México D.F.', '05022', 'Mexico'],
    ['Chop-suey Chinese', 'Yang Wang', 'Hauptstr. 29', 'Bern', '3012', 'Switzerland'],
    ['Comércio Mineiro', 'Pedro Afonso', 'Av. dos Lusíadas, 23', 'São Paulo', '05432-043', 'Brazil'],
  ];
  customers.forEach((c) => custStmt.run(...c));

  // Orders
  const orderStmt = db.prepare('INSERT INTO Orders (CustomerID, EmployeeID, OrderDate, ShipperID) VALUES (?, ?, ?, ?)');
  const orders = [
    [3, 4, '1996-07-04', 3],
    [7, 5, '1996-07-05', 1],
    [12, 3, '1996-07-08', 2],
    [1, 4, '1996-07-08', 1],
    [4, 1, '1996-07-09', 3],
    [2, 3, '1996-07-10', 2],
    [5, 6, '1996-07-11', 1],
    [8, 7, '1996-07-12', 3],
    [10, 2, '1996-07-15', 2],
    [6, 5, '1996-07-16', 1],
  ];
  orders.forEach((o) => orderStmt.run(...o));

  // OrderDetails
  const detailStmt = db.prepare('INSERT INTO OrderDetails (OrderID, ProductID, Quantity) VALUES (?, ?, ?)');
  const details = [
    [1, 11, 12], [1, 42, 10], [1, 72, 5],
    [2, 14, 9],  [2, 51, 40], [2, 41, 10],
    [3, 17, 35], [3, 13, 25],
    [4, 3, 6],   [4, 76, 15], [4, 33, 20],
    [5, 65, 10], [5, 51, 35],
    [6, 41, 25], [6, 57, 6],
    [7, 22, 15], [7, 57, 21], [7, 65, 20],
    [8, 20, 40], [8, 33, 25], [8, 60, 40],
    [9, 31, 20], [9, 39, 42], [9, 49, 40],
    [10, 6, 35], [10, 3, 25],
  ];
  details.forEach((d) => detailStmt.run(...d));
}
