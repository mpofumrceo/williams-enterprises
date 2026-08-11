import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Quotation, QuotationItem } from "@/src/types/database";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0A2540" },
  subtitle: { fontSize: 12, color: "#D97706", marginTop: 4 },
  section: { marginTop: 16 },
  label: { fontSize: 9, color: "#666", marginBottom: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0A2540", color: "#fff", padding: 6, marginTop: 12 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", padding: 6 },
  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "15%", textAlign: "center" },
  col4: { width: "15%", textAlign: "right" },
  col5: { width: "15%", textAlign: "right" },
  total: { fontSize: 14, fontWeight: "bold", color: "#0A2540", marginTop: 12, textAlign: "right" },
});

export function QuotationPDF({
  quote,
  items,
}: {
  quote: Quotation;
  items: QuotationItem[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Williams Enterprises</Text>
          <Text style={styles.subtitle}>Building Today, Transforming Tomorrow</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>QUOTE NUMBER</Text>
            <Text>{quote.quote_number}</Text>
          </View>
          <View>
            <Text style={styles.label}>DATE</Text>
            <Text>{quote.quote_date}</Text>
          </View>
          {quote.expiry_date && (
            <View>
              <Text style={styles.label}>EXPIRY</Text>
              <Text>{quote.expiry_date}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>CLIENT</Text>
          <Text>{quote.client_name}</Text>
          {quote.client_address && <Text>{quote.client_address}</Text>}
          {quote.client_email && <Text>{quote.client_email}</Text>}
          {quote.client_phone && <Text>{quote.client_phone}</Text>}
        </View>

        {quote.project_name && (
          <View style={styles.section}>
            <Text style={styles.label}>PROJECT</Text>
            <Text>{quote.project_name}</Text>
            {quote.project_location && <Text>{quote.project_location}</Text>}
          </View>
        )}

        {quote.description && (
          <View style={styles.section}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <Text>{quote.description}</Text>
          </View>
        )}

        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Unit</Text>
          <Text style={styles.col4}>Price</Text>
          <Text style={styles.col5}>Total</Text>
        </View>

        {items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{item.unit ?? ""}</Text>
            <Text style={styles.col4}>{item.unit_price.toFixed(2)}</Text>
            <Text style={styles.col5}>{(item.quantity * item.unit_price).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text>Subtotal: {quote.subtotal.toFixed(2)}</Text>
          {quote.discount > 0 && <Text>Discount: -{quote.discount.toFixed(2)}</Text>}
          {quote.tax_amount > 0 && <Text>Tax ({quote.tax_rate}%): {quote.tax_amount.toFixed(2)}</Text>}
          <Text style={styles.total}>TOTAL: {quote.total.toFixed(2)}</Text>
        </View>

        {quote.payment_terms && (
          <View style={styles.section}>
            <Text style={styles.label}>PAYMENT TERMS</Text>
            <Text>{quote.payment_terms}</Text>
          </View>
        )}

        {quote.terms_and_conditions && (
          <View style={styles.section}>
            <Text style={styles.label}>TERMS & CONDITIONS</Text>
            <Text>{quote.terms_and_conditions}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
