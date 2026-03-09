import sys
import os
sys.path.append(os.getcwd())
import analytics.urbano as an

print("Testing get_temporal_growth_indices...")
try:
    df_growth = an.get_temporal_growth_indices()
    print("Growth Indices OK. Shape:", df_growth.shape)
    print(df_growth.columns.tolist())
except Exception as e:
    print("Growth Indices FAILED:", e)

print("\nTesting get_correlation_matrix...")
try:
    df_corr = an.get_correlation_matrix()
    print("Correlation Matrix OK. Shape:", df_corr.shape)
except Exception as e:
    print("Correlation Matrix FAILED:", e)
