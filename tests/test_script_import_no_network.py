"""
tests/test_script_import_no_network.py
Proof suite for P05-009: Decouple network calls from import-time.

INVARIANTS:
1. Importing `scripts.test_embedding` MUST NOT trigger any network / HTTP socket requests.
2. Importing `scripts.test_page_queries` MUST NOT trigger any PostgreSQL database connections.
3. Socket / HTTP / Database calls must remain 0 during module collection / import-time.
4. Execution logic is cleanly isolated to on-demand function invocations.
"""
import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


class TestScriptImportNoNetwork(unittest.TestCase):

    def test_import_test_embedding_makes_zero_network_calls(self):
        """Proof: Importing scripts.test_embedding produces 0 network socket / HTTP calls."""
        # Unload module if previously loaded
        sys.modules.pop("scripts.test_embedding", None)

        with patch("urllib.request.urlopen") as mock_urlopen, \
             patch("http.client.HTTPConnection.connect") as mock_http_conn, \
             patch("socket.socket.connect") as mock_socket_connect:

            # Import module under strict network isolation
            import scripts.test_embedding as test_emb

            self.assertEqual(mock_urlopen.call_count, 0, "urllib.request.urlopen was called during import!")
            self.assertEqual(mock_http_conn.call_count, 0, "HTTPConnection.connect was called during import!")
            self.assertEqual(mock_socket_connect.call_count, 0, "socket.connect was called during import!")
            self.assertTrue(hasattr(test_emb, "test_gemini_embedding"))
            self.assertTrue(hasattr(test_emb, "build_embedding_request"))

    def test_build_embedding_request_structure(self):
        """Proof: build_embedding_request builds valid request without network call."""
        import scripts.test_embedding as test_emb
        url, body_bytes, headers = test_emb.build_embedding_request(
            api_key="TEST_API_KEY",
            text="Hồ Tà Pạ Tri Tôn",
            output_dim=768
        )
        self.assertIn("generativelanguage.googleapis.com", url)
        self.assertIn("key=TEST_API_KEY", url)
        self.assertEqual(headers.get("Content-Type"), "application/json")
        self.assertIn("Hồ Tà Pạ Tri Tôn".encode("utf-8"), body_bytes)

    def test_test_gemini_embedding_runs_on_demand_with_mock(self):
        """Proof: test_gemini_embedding executes cleanly when called with dependency injection."""
        import scripts.test_embedding as test_emb
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"embedding": {"values": [0.1, 0.2, 0.3]}}'
        mock_response.__enter__.return_value = mock_response

        mock_caller = MagicMock(return_value=mock_response)
        result = test_emb.test_gemini_embedding(
            api_key="TEST_API_KEY",
            text="Hồ Tà Pạ",
            output_dim=3,
            urlopen_fn=mock_caller
        )

        self.assertEqual(mock_caller.call_count, 1)
        self.assertTrue(result["success"])
        self.assertEqual(result["dimension"], 3)
        self.assertEqual(result["embedding"], [0.1, 0.2, 0.3])

    def test_import_test_page_queries_makes_zero_db_connections(self):
        """Proof: Importing scripts.test_page_queries produces 0 database / socket connections."""
        sys.modules.pop("scripts.test_page_queries", None)

        with patch("psycopg2.connect") as mock_pg_conn, \
             patch("socket.socket.connect") as mock_socket_connect:

            import scripts.test_page_queries as test_pq

            self.assertEqual(mock_pg_conn.call_count, 0, "psycopg2.connect was called during import!")
            self.assertEqual(mock_socket_connect.call_count, 0, "socket.connect was called during import!")
            self.assertTrue(hasattr(test_pq, "run_page_queries_test"))

    def test_run_page_queries_test_runs_on_demand_with_mock(self):
        """Proof: run_page_queries_test executes on-demand with injected connector."""
        import scripts.test_page_queries as test_pq
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        mock_conn.cursor.return_value = mock_cur
        mock_cur.fetchone.return_value = [149]
        mock_cur.fetchall.return_value = [("nature", "Danh thắng", 10)]

        mock_connector = MagicMock(return_value=mock_conn)
        result = test_pq.run_page_queries_test(
            database_url="postgresql://test:test@localhost:5432/test",
            connection_fn=mock_connector
        )

        self.assertEqual(mock_connector.call_count, 1)
        self.assertTrue(result["success"])
        self.assertEqual(result["summary"]["total_active"], 149)
        self.assertTrue(mock_cur.close.called)
        self.assertTrue(mock_conn.close.called)


if __name__ == "__main__":
    unittest.main()
