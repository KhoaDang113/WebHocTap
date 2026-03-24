package com.example.WebHocTap;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

public class QuizLogicTest {

    @Test
    public void testScoreCalculation() {
        int total = 10;
        int correct = 5;
        double score = (total > 0) ? ((double) correct / total) * 10.0 : 0.0;
        assertEquals(5.0, score, 0.001);
        
        total = 3;
        correct = 1;
        score = (total > 0) ? ((double) correct / total) * 10.0 : 0.0;
        assertEquals(3.3333333333333335, score, 0.001);
        
        boolean passed = (score >= 5.0);
        assertFalse(passed);
    }
}
